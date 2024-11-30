import { ITopologyRepository, ITopologyService } from "../types/classInterfaces";
import { CreateTopologyDTO, CreatedTopologyResponse, Topology, UpdateTopologyDTO } from "../types/types";

export class TopologyService implements ITopologyService {
    private topologyRepository: ITopologyRepository;

    constructor(topologyRepository: ITopologyRepository) {
        this.topologyRepository = topologyRepository;
    }

    createTopology(userId: number, requestData: CreateTopologyDTO): Promise<CreatedTopologyResponse> {
        return this.topologyRepository.create(userId, requestData);
    }

    getAllTopologies(userId: number): Promise<Topology[] | null> {
        return this.topologyRepository.findAll(userId);
    }

    getTopologyById(userId: number, topologyId: number): Promise<Topology | null> {
        return this.topologyRepository.findOne(userId, topologyId);
    }

    updateTopology(topologyId: number, topologyData: UpdateTopologyDTO): Promise<Topology> {
        return this.topologyRepository.update(topologyId, topologyData);
    }

    deleteTopology(topologyId: number): Promise<Topology | null> {
        return this.topologyRepository.delete(topologyId);
    }

}