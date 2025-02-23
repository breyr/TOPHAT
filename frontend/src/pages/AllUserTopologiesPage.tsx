import { useEffect, useState } from 'react';
import type { PartialAppUser, Topology } from '../../../common/src/index';
import TopologyCard from '../components/TopologyCard';
import { useAuth } from '../hooks/useAuth';
import { User } from '../models/User';

export default function AllUserTopologiesPage() {
  const { token, user, authenticatedApiClient } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [topologies, setTopologies] = useState<Topology[]>([]);



  const handleDelete = async (topologyId: number) => {
    if (!token) {
      return;
    }
    try {
      const response = await authenticatedApiClient.deleteTopology(topologyId);
      // update topologies list on success
      setTopologies((prevTopologies) => prevTopologies.filter(topology => topology.id !== response.data?.topologyId));
    } catch (error) {
      console.error('Error deleting topology:', error);
    }
  }

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
    <section className="pt-4 flex flex-col gap-y-4">
      {users.length ? (
        users.map((u) => {
          const userTopologies = topologies.filter(
            (topology) => topology.userId === u.id
          );
          return (
            <div key={u.id} className="relative p-2">
              <p className='absolute -top-1 left-4 bg-[#ffffff] px-2'>{u.email}</p>
              <section className="flex flex-row flex-wrap gap-x-8 p-2 border rounded">
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
        <p>No users found.</p>
      )}
    </section>
  );
}
