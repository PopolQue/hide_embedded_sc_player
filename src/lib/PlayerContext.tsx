import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { PLAYLISTS } from './index';

interface PlayerContextType {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    activePlaylistKey: string;
    setActivePlaylistKey: (key: string) => void;
    activeTrackIndex: number;
    setActiveTrackIndex: (index: number) => void;
    progress: number;
    setProgress: (progress: number) => void;
    volume: number;
    setVolume: (volume: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
    // Initial state logic lifted from SCPlayer
    const [isPlaying, setIsPlaying] = useState(false);
    const [activePlaylistKey, setActivePlaylistKey] = useState(Object.keys(PLAYLISTS)[0]);
    const [activeTrackIndex, setActiveTrackIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(100);

    return (
        <PlayerContext.Provider value={{
            isPlaying, setIsPlaying,
            activePlaylistKey, setActivePlaylistKey,
            activeTrackIndex, setActiveTrackIndex,
            progress, setProgress,
            volume, setVolume
        }}>
            {children}
        </PlayerContext.Provider>
    );
};

export const usePlayer = () => {
    const context = useContext(PlayerContext);
    if (!context) {
        throw new Error('usePlayer must be used within a PlayerProvider');
    }
    return context;
};
