import { Node } from "@xyflow/react";
import type { PartialAppUser, Topology } from 'common';
import { useEffect, useState } from 'react';
import TopologyCard from '../components/TopologyCard';
import { useAuth } from '../hooks/useAuth';
import { useLinkOperationsBase } from "../hooks/useLinkOperations";
import { Device } from '../models/Device';
import { User } from '../models/User';

export default function AllUserTopologiesPage() {
  const { token, user, authenticatedApiClient } = useAuth();
  const { deleteLinkBulk } = useLinkOperationsBase();
  const [users, setUsers] = useState<User[]>([]);
  const [topologies, setTopologies] = useState<Topology[]>([]);

  const unbookDevicesInTopology = async (topologyData: Topology) => {
    try {
      // check if nodes exist
      const nodes = topologyData.reactFlowState?.nodes as Node<{ deviceData?: Device }>[] | undefined;

      if (nodes && nodes.length > 0) {
        // extract device IDs from all nodes in the topology
        const devicePromises = nodes
          .filter(node => node.data?.deviceData?.id)
          .map(node => {
            // send request to unbook each device
            if (node.data.deviceData)
              return authenticatedApiClient.unbookDevice(node.data.deviceData.id);
          });

        // if there are devices to unbook, wait for all requests to complete
        if (devicePromises.length > 0) {
          await Promise.all(devicePromises);
        }
      }
    } catch (error) {
      console.error('Error unbooking devices:', error);
    }
  };

  const handleDelete = async (topologyId: number) => {
    if (!token) return;

    try {
      // First, get the topology data to unbook devices
      const getResponse = await authenticatedApiClient.getTopology(topologyId);
      const topology = getResponse.data;

      if (topology) {
        const deletedTopology = topologies.find((t) => t.id === topologyId);
        const deletedTopologyIndex = topologies.findIndex((t) => t.id === topologyId);

        // Update UI - remove the topology immediately
        setTopologies((prevTopologies) =>
          prevTopologies.filter(t => t.id !== deletedTopology?.id)
        );

        // Unbook devices first
        await unbookDevicesInTopology(topology);

        // Get a list of Options to pass into the clearLinkBulk function
        const edgesForTopology = topology.reactFlowState?.edges.map(e => ({
          value: e.id,
          label: `(${e.source}) ${e.data?.sourcePort ?? ''} -> (${e.target}) ${e.data?.targetPort ?? ''}`,
          firstLabDevice: e.source,
          firstLabDevicePort: e.data?.sourcePort ?? '',
          secondLabDevice: e.target,
          secondLabDevicePort: e.data?.targetPort ?? '',
        }));

        // Clear Links
        const numFailures = await deleteLinkBulk(new Set(edgesForTopology));

        if (numFailures === 0) {
          // then delete the topology
          await authenticatedApiClient.deleteTopology(topologyId);
        } else {
          // add topology back
          setTopologies((prevTopologies) => {
            const newTopologies = [...prevTopologies];

            // if we have a valid index and a deleted topology
            if (deletedTopologyIndex >= 0 && deletedTopology) {
              // insert back at original position
              newTopologies.splice(deletedTopologyIndex, 0, deletedTopology);
            } else if (deletedTopology) {
              newTopologies.push(deletedTopology);
            }

            return newTopologies;
          });
        }
      }
    } catch (error) {
      console.error('Error deleting topology:', error);
    }
  };
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await authenticatedApiClient.getAllUsers();
        const filteredUsers = res.data?.filter((appUser: PartialAppUser) => appUser.id !== user?.id);
        const usersWithFlag = filteredUsers?.map((appUser: PartialAppUser) => User.fromDatabase(appUser));
        setUsers(usersWithFlag || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };


    const fetchTopologies = async () => {
      try {
        const res = await authenticatedApiClient.getAllUsersTopologies();
        setTopologies(res.data || []);
      } catch (error) {
        console.error('Error fetching topologies:', error);
      }
    };

    fetchUsers();
    fetchTopologies();
  }, [user, authenticatedApiClient]);



  return (
    <section className="pt-4 flex flex-col gap-y-4 mt-4">
      {users.length ? (
        users.map((u) => {
          const userTopologies = topologies.filter(
            (topology) => topology.userId === u.id
          );
          return (
            <div key={u.id} className="relative p-2 pt-6">
              <p className='absolute -top-1 left-4 bg-[#ffffff] px-2'>{u.email}</p>
              <section className="flex flex-row flex-wrap gap-x-8 p-2 border rounded pl-7">
                {userTopologies.length ? (
                  userTopologies.map((topology) => (
                    <TopologyCard
                      key={topology.id}
                      {...topology}
                      onDelete={() => handleDelete(topology.id)}
                      onArchive={() => console.log("Archive", topology.id)}
                      readOnly={false}
                    />
                  ))
                ) : (
                  <p>No topologies for this user</p>
                )}
              </section>
            </div>
          );
        })
      ) : (
        <p className='pt-6'>No users found.</p>
      )}
    </section>
  );
}