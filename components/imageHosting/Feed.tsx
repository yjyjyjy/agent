import Posts from "./Posts"
import { Character } from "@/lib/types"
// import { useSession } from "next-auth/react";

export interface FeedProps extends React.ComponentProps<'div'> {
    id?: string
    character?: Character
}

function Feed({id, character} : FeedProps) {
    // const {data: session} = useSession();
    
    return (
        <main className={`grid grid-cols-1 md:grid-cols-2 md:max-w-3xl xl:grid-cols-3 xl:max-w-6xl mx-auto`}>
            <section className='col-span-2'>
                <Posts id={id} character={character}/>
            </section>
        </main>
    )
}

export default Feed