from enum import Enum
import uvicorn
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from netmiko import ConnectHandler
from dotenv import load_dotenv
import jwt
import os

load_dotenv()
SECRET_KEY = os.environ.get("SECRET_KEY")
app = FastAPI()


class LinkRequest(BaseModel):
    ip1: str
    ip2: str
    port1: str
    port2: str
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


class JwtPayload:
    id: int
    username: str
    email: str
    accountType: AccountType
    accountStatus: AccountStatus


# helper function for decoding JWTs
def decode_jwt(token: str) -> JwtPayload:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return JwtPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


def generate_vlan_id(port1: str, port2: str) -> int:
    """
    Generate a unique vlan ID for the pair of ports.
    This function extracts the integer from the last slash
    in the port strings (e.g., Gig1/0/10 -> 10), ensuring
    we can still apply the uniqueness formula (p1 - 1)*48 + p2.
    """
    # Extract last numeric segment from each port
    last_number1 = int(port1.split("/")[-1])
    last_number2 = int(port2.split("/")[-1])

    # Sort them if order doesn't matter
    p1, p2 = sorted([last_number1, last_number2])

    # Generate VLAN ID
    vlan_id = (p1 - 1) * 48 + p2
    return vlan_id


def generate_create_link_config(port: str, vlan_id: int):
    """
    Generate the config to enable L2 protocol tunneling on a port,
    add it to a VLAN named after plan_id, etc.
    Adjust these lines to match your environment's needed commands.
    """
    return [
        f"vlan {vlan_id}",
        f" name LINK_{vlan_id}",
        f"interface {port}",
        " no shutdown",
        f" description LINK_{vlan_id}",
        " switchport mode access",
        f" switchport access vlan {vlan_id}",
        " l2protocol-tunnel",
        " l2protocol-tunnel point-to-point",
    ]


def generate_clear_link_config(port: str):
    """
    Generate the config to remove L2 tunneling and shut down the port.
    """
    return [
        f"interface {port}",
        " shutdown",
        " no description",
        " no switchport access vlan",
    ]


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
    vlan_id = generate_vlan_id(req.port1, req.port2)

    # Create config sets for each device
    config_device1 = generate_create_link_config(req.port1, vlan_id)
    config_device2 = generate_create_link_config(req.port2, vlan_id)

    try:
        output1 = apply_config_to_device(
            req.ip1, req.username, req.password, req.secret, config_device1
        )
        output2 = apply_config_to_device(
            req.ip2, req.username, req.password, req.secret, config_device2
        )

        return {
            "status": "success",
            "message": f"Link created successfully with vlan ID {vlan_id}",
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
    plan_id = generate_vlan_id(req.port1, req.port2)

    # Clear config sets for each device
    config_device1 = generate_clear_link_config(req.port1)
    config_device2 = generate_clear_link_config(req.port2)

    try:
        output1 = apply_config_to_device(
            req.ip1, req.username, req.password, req.secret, config_device1
        )
        output2 = apply_config_to_device(
            req.ip2, req.username, req.password, req.secret, config_device2
        )

        return {
            "status": "success",
            "message": f"Link cleared successfully for vlan ID {plan_id}",
            "device1_output": output1,
            "device2_output": output2,
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    # Run with: uvicorn app:app --reload --host 0.0.0.0 --port 8000
    uvicorn.run(app, host="0.0.0.0", port=4000)
