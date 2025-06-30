import React, { useEffect, useState } from 'react';
import { useRoom, useParticipant, VideoTrack } from '@livekit/components-react';
import '@livekit/components-styles';

interface VideoAgentProps {
  roomName: string;
  token: string;
}

const VideoAgent: React.FC<VideoAgentProps> = ({ roomName, token }) => {
  const [isConnected, setIsConnected] = useState(false);
  const room = useRoom();
  
  useEffect(() => {
    const connectToRoom = async () => {
      try {
        await room.connect(token, {
          roomName: roomName
        });
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to room:', error);
      }
    };

    connectToRoom();

    return () => {
      room.disconnect();
    };
  }, [room, token, roomName]);

  if (!isConnected) {
    return <div>Connecting to virtual classroom...</div>;
  }

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <VideoTrack 
        trackSid="tavus-video" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoAgent;