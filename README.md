# T.O.P. (Topology Orchestration Platform)

## Installation

### STEP 1 - Interconnects

### Supported Platforms
Interconnect devices must meet the following requirements to ensure compatibility with TOPHAT:

**Operating System (OS)**

  - Cisco IOSv
  - Cisco IOS
  - Cisco IOS-XE

**Port Density**

TOPHAT can support up to 2 Interconnect devices, each with varying port densities:

  - **1x Interconnects**
      - Must be 48 ports
  - **2x Interconnects**
      - Interconnect 1: 48 ports
      - Interconnect 2: 24-48 ports

---

#### Initial Configuration

Interconnect devices must be **remotely accessible** via **SSH** from the **out-of-band (OOB) management interface** to the TOPHAT application host.

It is recommended to use spanning-tree mode MST, and static assign OOB IP addresses for the Interconnects.

---

##### Authentication

- **SSH Access**: Required for secure remote administration.
- **User Authentication**: Devices must support **username/password authentication**.
- **Privilege Escalation**: An **enable secret password** must be configured for administrative access.

An example basic configuration is provided below:

```
hostname Interconnect
ip domain-name interconnect.lab
username admin privilege 15 secret 0 cisco
enable secret cisco
line vty 0 15
  login local
  transport input ssh
crypto key generate rsa modulus 2048
ip ssh version 2
```

---

##### Lab Device Ports

All device interfaces (**excluding the last four ports**) must be configured for **dot1q tunneling (QinQ)** to encapsulate Layer 2 protocol frames. These ports serve as direct connections to lab devices.

```
interface range GigabitEthernet1/0/1-44
  shutdown
  no switchport access vlan
  switchport mode dot1q-tunnel
  negotiation auto
  mtu 9000
  mtu 8978
  l2protocol-tunnel cdp
  l2protocol-tunnel lldp
  l2protocol-tunnel stp
  l2protocol-tunnel vtp
  l2protocol-tunnel point-to-point pagp
  l2protocol-tunnel point-to-point lacp
  l2protocol-tunnel point-to-point udld
  no cdp enable
```

---

##### Transport Ports

The last four interfaces (**45-48** or **21-24**, depending on the platform) are dedicated to **transporting traffic between Interconnects**.

*If you are only using one Interconnect, shut these ports.*

```
port-channel load-balance src-dst-mac
!
interface GigabitEthernet1/0/45-48
  channel-protocol lacp
  channel-group 1 mode active
  no shutdown
!
interface Port-channel1
  switchport mode trunk
  switchport trunk allowed vlan all
  switchport nonegotiate
  mtu 9000
  mtu 8978
  no cdp enable
  no shutdown
```

### STEP 2 - Application

#### Environment Setup

Once the Interconnects are configured, proceed with the installation of the TOPHAT application.

Navigate to the [TOPHAT GitHub](https://github.com/breyr/TOPHAT/blob/main/compose.prod.yaml) repository, and make a copy of the `compose.prod.yaml` file.

Save the file as `docker-compose.yml` in your desired directory.

#### Running the Application

Run the following command to start the application:

```sh
docker-compose -f docker-compose.yml up -d
```

TOPHAT will now be running at [0.0.0.0:80](0.0.0.0:80).

To expose TOPHAT outside of your LAN, we recommend using [Cloudflare Tunnels](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) to securely expose the UI externally with ZeroTrust.

## Developing

Create a new branch from `dev`

### Setting Up

1. Clone the repo
2. Add a .env file within `/backend` with the following:
   
   ```
   DATABASE_URL="postgres://demo:demo@localhost:5432/demo"
   SECRET_KEY="my_secret_key"
   ```
3. Run `npm install` in the root directory of this project.
  
### Starting Development Environment

1. Run `docker compose -f compose.dev.yaml up --build`

   This runs the postgres db and interconnect api container.
   
2. Run `npm run dev:backend` and `npm run dev:frontend` within the project root.

### Pull Requests

When you are ready to submit a pull request, make sure you merge from your branch into `dev`.

## Releases

Peridocially we will create release branches from `dev`. These branches will follow these naming convention:

`release-<Major>-<Minor>-<Build>`

**`<Major>-<Minor>-<Build>`** is used to create a new image per release, tagged with `release-<Major>-<Minor>-<Build>`

### Steps for release:

1. Create release branch from dev
2. Make any changes in that release branch to make sure everything builds
3. Merge release branch into main
4. Merge main into dev

### Notes on Using Production Compose File

The `SECRET_KEY` value must be the same for **backend** and **interconnect-api**.

## Images

Images are automatically built when release branches get merged into main.

[TOP Backend](https://hub.docker.com/r/breyr/top-backend)

[TOP Frontend](https://hub.docker.com/r/breyr/top-frontend)

[TOP InterconnectAPI](https://hub.docker.com/r/breyr/top-interconnectapi)
