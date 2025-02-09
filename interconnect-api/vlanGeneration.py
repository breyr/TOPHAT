def map_ipids_to_vlanid(port1, port2):
    """
    Given two lab port IDs (each from 1 to 88), return a unique VLAN ID
    between 1 and 4096, skipping VLAN IDs 1002-1024.

    The mapping works by converting the unordered pair (with ordering enforced
    by sorting) into a unique number between 1 and 3916 (since (88 * 89)/2 = 3916)
    and then shifting the result upward by 23 if the unique index is >= 1002.
    
    Args:
        port1 (int): A lab port ID (1 <= port1 <= 88)
        port2 (int): A lab port ID (1 <= port2 <= 88)

    Returns:
        int: The VLAN ID assigned to this unordered pair.
    
    Raises:
        ValueError: If either port ID is not in the range 1 to 88.
    """
    # Validate port IDs
    if not (1 <= port1 <= 88) or not (1 <= port2 <= 88):
        raise ValueError("Port IDs must be between 1 and 88.")

    # Order the two ports to treat (port1, port2) and (port2, port1) as the same pair.
    a, b = sorted((port1, port2))

    # Calculate how many pairs come before the row for 'a'.
    # For each i from 1 to (a - 1), there are (89 - i) pairs.
    sum_before = 89 * (a - 1) - ((a - 1) * a) // 2

    # The offset within the row for 'a' is (b - a).
    index = sum_before + (b - a)

    # Convert from 0-indexed to 1-indexed (so that (1,1) maps to 1, etc.).
    unique_index = index + 1  # This value will be in the range 1..3916.

    # Adjust for reserved VLAN IDs: if unique_index is 1002 or higher, shift it upward by 23.
    if unique_index >= 1002:
        vlan_id = unique_index + 23
    else:
        vlan_id = unique_index

    return vlan_id