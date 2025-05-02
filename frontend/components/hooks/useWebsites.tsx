"use client";
import { API_BACKEND_URL } from "../../config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useAuthStore } from '@/lib/auth';
interface Website {
    id: string;
    url: string;
    ticks: {
        id: string;
        createdAt: string;
        status: string;
        latency: number;
    }[];
}

export function useWebsites() {
    const { token,userId } = useAuthStore();
    const [websites, setWebsites] = useState<Website[]>([]);

    async function refreshWebsites() {    
        const response = await axios.get(`${API_BACKEND_URL}/api/websites?user_id=`+userId, {
            headers: {
                Authorization: token,
            },
        });

        setWebsites(response.data.data.websites);
    }

    useEffect(() => {
        refreshWebsites();

        const interval = setInterval(() => {
            refreshWebsites();
        }, 1000 * 60 * 1);

        return () => clearInterval(interval);
    }, []);

    return { websites, refreshWebsites };

}