from enum import Enum
import uvicorn
from fastapi import Depends, FastAPI, HTTPException, Header
from pydantic import BaseModel
from netmiko import ConnectHandler
from dotenv import load_dotenv
import jwt
import os
from vlanGeneration import map_ipids_to_vlanid
from configGeneration import generate_clear_link_config, generate_create_link_config

load_dotenv()
SECRET_KEY = os.environ.get("SECRET_KEY")
app = FastAPI(root_path="/interconnect")


class LinkRequest(BaseModel):
    interconnect1IP: str
    interconnect1Prefix: str
    interconnect2IP: str
    interconnect2Prefix: str
    interconnectPortID1: int
    interconnectPortID2: int
    username: str
    password: str
    secret: str


class AccountType(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    OWNER = "OWNER"


class AccountStatus(str, Enum):
    NOTCREATED = "NOTCREATED"
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"


class JwtPayload(BaseModel):
    id: int
    username: str
    email: str
    accountType: AccountType
    accountStatus: AccountStatus


# helper function for decoding JWTs
def decode_jwt(authorization: str = Header(...)) -> JwtPayload:
    try:
        token = authorization.split(" ")[1]
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return JwtPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def _process_ports(port_id_1: str, port_id_2: str, req: LinkRequest):
    """
    Processes port IDs and assigns the correct prefixes and device IPs.

    Args:
        port_id_1 (str): First interconnect port ID.
        port_id_2 (str): Second interconnect port ID.
        req (LinkRequest): Request object containing device IPs and prefixes.

    Returns:
        tuple: (formatted_ports, device_ips)
    """
    interconnect_ports = [port_id_1, port_id_2]
    formatted_ports = []
    formatted_prefixes = []
    device_ips = []

    for port_id in interconnect_ports:
        port_number = int(port_id)

        if port_number > 44:
            port_number -= 44
            device_ips.append(req.interconnect2IP)
            formatted_prefixes.append(req.interconnect2Prefix)
        else:
            device_ips.append(req.interconnect1IP)
            formatted_prefixes.append(req.interconnect1Prefix)

        formatted_ports.append(f"{formatted_prefixes[-1]}{port_number}")

    return formatted_ports, device_ips


def apply_config_to_device(
    host: str, username: str, password: str, secret: str, config_commands: list
) -> str:
    """
    Connect to a device using Netmiko, enter enable mode, send config, save, and disconnect.
    Returns the output from the config session for logging/debugging.
    """
    device_params = {
        "device_type": "cisco_ios",
        "ip": host,
        "username": username,
        "password": password,
        "secret": secret,
        "disabled_algorithms": {"kex": [], "crypto": [], "mac": []},
    }

    try:
        connection = ConnectHandler(**device_params)
        # Enter enable mode
        connection.enable()
        # Send config
        output = connection.send_config_set(config_commands)
        # (Optional) Save config
        connection.save_config()
        connection.disconnect()
        return output
    except Exception as e:
        raise RuntimeError(f"Failed to configure device {host}: {e}")


@app.post("/create_link")
def create_link(req: LinkRequest, payload: JwtPayload = Depends(decode_jwt)):
    """
    Create a new L2 Tunneling link between two ports on two separate devices.
    """
    vlan_id = map_ipids_to_vlanid(req.interconnectPortID1, req.interconnectPortID2)

    # Use helper function to process ports
    formatted_ports, device_ips = _process_ports(
        req.interconnectPortID1, req.interconnectPortID2, req
    )

    config_device1 = generate_create_link_config(formatted_ports[0], vlan_id)
    config_device2 = generate_create_link_config(formatted_ports[1], vlan_id)

    try:
        output1 = apply_config_to_device(
            device_ips[0], req.username, req.password, req.secret, config_device1
        )
        output2 = apply_config_to_device(
            device_ips[1], req.username, req.password, req.secret, config_device2
        )

        return {
            "status": "success",
            "message": f"Link created successfully with VLAN ID {vlan_id}",
            "device1_output": output1,
            "device2_output": output2,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/clear_link")
def clear_link(req: LinkRequest, payload: JwtPayload = Depends(decode_jwt)):
    """
    Remove the L2 Tunneling link configuration and shut down the ports.
    """
    vlan_id = map_ipids_to_vlanid(req.interconnectPortID1, req.interconnectPortID2)

    # Process port IDs and assign the correct prefixes and device IPs
    interconnect_port_ids = [req.interconnectPortID1, req.interconnectPortID2]
    formatted_ports = []
    formatted_prefixes = []
    device_ips = []

    for port_id in interconnect_port_ids:
        port_number = int(port_id)
        if port_number > 44:
            port_number -= 44
            device_ips.append(req.interconnect2IP)
            formatted_prefixes.append(req.interconnect2Prefix)
        else:
            device_ips.append(req.interconnect1IP)
            formatted_prefixes.append(req.interconnect1Prefix)
        formatted_ports.append(f"{formatted_prefixes[-1]}{port_number}")

    # Generate clear configurations
    config_device1 = generate_clear_link_config(formatted_ports[0])
    config_device2 = generate_clear_link_config(formatted_ports[1])

    try:
        output1 = apply_config_to_device(
            device_ips[0], req.username, req.password, req.secret, config_device1
        )
        output2 = apply_config_to_device(
            device_ips[1], req.username, req.password, req.secret, config_device2
        )

        return {
            "status": "success",
            "message": f"Link cleared successfully for VLAN ID {vlan_id}",
            "device1_output": output1,
            "device2_output": output2,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    # Run with: uvicorn app:app --reload --host 0.0.0.0 --port 8000
    uvicorn.run(app, host="0.0.0.0", port=4000)
