import { useNavigate } from "react-router-dom";
import TopologyName from "../components/reactflow/overlayui/TopologyName";
import TopologyCanvasWrapper from "../components/reactflow/TopologyCanvas";

export default function TopologyPage() {

    const navigateTo = useNavigate();

    return (
        <section className="flex flex-col h-screen">
            <nav className="w-full flex flex-row justify-between border-b-2 py-2 px-2">
                <TopologyName />
                <div className="flex flex-row items-center gap-2">
                    <h4 onClick={() => navigateTo('/dashboard/')} className="hover:cursor-pointer hover:text-blue-400">Dashboard</h4>
                    <h4 className="hover:cursor-pointer hover:text-blue-400">Settings</h4>
                </div>
            </nav>
            <div className="flex-grow">
                <TopologyCanvasWrapper />
            </div>
        </section>
    );
}