import { PlusCircle } from "lucide-react"

export default function UserTopologiesPage() {
    return (
        <section className="pt-[1rem]">
            <div className="my-5 rounded-md size-52 border-dashed border-2 bg-gray-50 flex flex-col justify-center items-center gap-3 text-gray-300 hover:cursor-pointer">
                <PlusCircle size={40} />
                <p>Create Topology</p>
            </div>
        </section>
    )
}
