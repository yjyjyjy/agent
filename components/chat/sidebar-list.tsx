import { SidebarItem } from '@/components/chat/sidebar-item'
import axios from 'axios';
import { useEffect, useState} from 'react';
import { SidebarActions } from '@/components/chat/delete-chat';
export interface SidebarListProps {
  userId?: string
}

export function SidebarList({ userId }: SidebarListProps) {
  const [chats, setChats] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const { data } = await axios.get('/api/chat/get_chats');
      setChats(data);
    }
    fetchData();
  }, []);
  // console.log('SidebarList.chats', chats);
  return (
    <div className="flex-1 overflow-auto">
      {chats?.length ? (
        <div className="space-y-2 px-2">
          {chats.map(
            chat =>
              chat && (
                <SidebarItem key={chat?.id} chat={chat}>
                  {/* <SidebarActions // this is for the share/delete buttons
                    chat={chat}
                  />  */}
                </SidebarItem>
              )
          )}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No chat history</p>
        </div>
      )}
    </div>
  )
}
