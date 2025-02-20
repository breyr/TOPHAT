def generate_create_link_config(interface: str, vlan_id: int):
    """
    Generate the config to enable L2 protocol tunneling on a port,
    add it to a VLAN named after plan_id, etc.
    Adjust these lines to match your environment's needed commands.
    """
    return [
        f"vlan {vlan_id}",
        f" name LINK_{vlan_id}",
        f"interface {interface}",
        f" description LINK_{vlan_id}",
        f" switchport access vlan {vlan_id}",
        f" no shutdown",
    ]


def generate_clear_link_config(interface: str):
    """
    Generate the config to remove L2 tunneling and shut down the port.
    """
    return [
        f"interface {interface}",
        f" shutdown",
        f" no description",
        f" no switchport access vlan",
    ]