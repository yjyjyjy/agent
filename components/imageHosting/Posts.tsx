import Post from "components/imageHosting/Post"
import { useEffect, useState } from "react"
import { app, db, storage } from "../../firebase/config";
import { collection, onSnapshot, orderBy, query } from "@firebase/firestore";
import * as React from 'react'
import { Character } from "@/lib/types"

export interface PostsProps extends React.ComponentProps<'div'> {
  id?: string
  character?: Character
}


function Posts({ id, character }: PostsProps) {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    const collectionRef = collection(db, 'posts', id, 'posts');
    const q = query(collectionRef, orderBy('timestamp', 'desc'))
    console.log('q', q)
    onSnapshot(q, snapshot => {
      console.log('snapshot', snapshot.docs)
      setPosts(snapshot.docs);
    })
  }, [db]
  )
  return (
    <div className="flex flex-col justify-center items-center mb-10">
      {posts.map(post => (
        <Post key={post.id} id={post.id} date={new Date(post.data().timestamp?.seconds * 1000).toISOString().slice(0, 10)} media={post.data().image} caption={post.data().caption} mediaformat={"jpg"} character={character} />
      ))}
    </div>
  )
}

export default Posts