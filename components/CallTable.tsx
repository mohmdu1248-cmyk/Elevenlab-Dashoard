'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/api';
import { format } from 'date-fns';
import { Phone, CheckCircle, XCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import AudioPlayer from './AudioPlayer';

interface Call {
    conversation_id: string;
    start_time_unix_secs: number;
    call_duration_secs: number;
    status: string;
    direction: 'inbound' | 'outbound';
    agent_name?: string;
    metadata?: {
        phone_call?: {
            agent_number?: string;
            external_number?: string;
        };
    };
}

export default function CallTable() {
    const { data, error, isLoading } = useSWR<{ conversations: Call[] }>('/api/conversations', fetcher, {
        refreshInterval: 30000,
    });

    const [filterType, setFilterType] = useState<string>('all');
    const [selectedAgent, setSelectedAgent] = useState<string>('all');
    const [activeAudioSrc, setActiveAudioSrc] = useState<string | null>(null);

    if (error) return <div className="text-red-500 p-4">Failed to load calls</div>;
    if (isLoading) return <div className="text-gray-400 p-4 animate-pulse">Scanning deep space frequencies...</div>;

    const calls = data?.conversations || [];

    // Extract Unique Agents
    const agents = Array.from(new Set(
        calls
            .map(c => c.metadata?.phone_call?.agent_number)
            .filter(Boolean) as string[]
    ));

    const filteredCalls = calls.filter((call) => {
        const matchesType = filterType === 'all' || call.direction === filterType;
        const matchesAgent = selectedAgent === 'all' || call.metadata?.phone_call?.agent_number === selectedAgent;
        return matchesType && matchesAgent;
    });

    return (
        <div className="w-full overflow-x-auto rounded-xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
            {/* Filter Controls */}
            <div className="p-4 border-b border-white/10 flex flex-wrap items-center gap-4">

                {/* Direction Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Direction:</span>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-black/50 border border-white/20 rounded px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                        <option value="all">All</option>
                        <option value="inbound">Inbound</option>
                        <option value="outbound">Outbound</option>
                    </select>
                </div>

                {/* Agent Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Agent Number:</span>
                    <select
                        value={selectedAgent}
                        onChange={(e) => setSelectedAgent(e.target.value)}
                        className="bg-black/50 border border-white/20 rounded px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                        <option value="all">All Agents</option>
                        {agents.map(agent => (
                            <option key={agent} value={agent}>{agent}</option>
                        ))}
                    </select>
                </div>

            </div>

            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-sm uppercase tracking-wider">
                        <th className="p-4 font-medium">Date/Time</th>
                        <th className="p-4 font-medium">Direction</th>
                        <th className="p-4 font-medium">Agent / Caller</th>
                        <th className="p-4 font-medium">Duration</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium text-center">Recording</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {filteredCalls.map((call) => {
                        const statusSuccess = call.status === 'success' || call.status === 'done';
                        const audioSrc = `/api/conversations/${call.conversation_id}/audio`;

                        // Extract phone numbers
                        const agentPhone = call.metadata?.phone_call?.agent_number;
                        const clientPhone = call.metadata?.phone_call?.external_number;

                        return (
                            <tr key={call.conversation_id} className="hover:bg-white/5 transition-colors group">
                                {/* Date */}
                                <td className="p-4 text-gray-300 whitespace-nowrap">
                                    {call.start_time_unix_secs
                                        ? format(new Date(call.start_time_unix_secs * 1000), 'MMM d, h:mm a')
                                        : <span className="text-gray-600 italic">Unknown Date</span>}
                                </td>

                                {/* Direction */}
                                <td className="p-4">
                                    <span className={`flex items-center gap-2 text-xs font-mono uppercase tracking-wide ${call.direction === 'inbound' ? 'text-emerald-400' : 'text-indigo-400'
                                        }`}>
                                        {call.direction === 'inbound'
                                            ? <ArrowDownLeft className="w-4 h-4" />
                                            : <ArrowUpRight className="w-4 h-4" />
                                        }
                                        {call.direction}
                                    </span>
                                </td>

                                {/* Agent / Caller ID */}
                                <td className="p-4 text-white font-mono text-sm">
                                    <div className="flex flex-col gap-1.5">
                                        {/* Primary Name */}
                                        <span className="text-gray-200 font-bold tracking-tight">{call.agent_name || 'Unknown Agent'}</span>

                                        {/* Detailed Phone Info */}
                                        <div className="flex flex-col gap-1 text-[11px] text-gray-500 font-mono">
                                            {agentPhone && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="bg-indigo-500/20 text-indigo-300 px-1 rounded">AGT</span>
                                                    <span>{agentPhone}</span>
                                                </div>
                                            )}
                                            {clientPhone && (
                                                <div className="flex items-center gap-1.5">
                                                    <span className="bg-emerald-500/20 text-emerald-300 px-1 rounded">USR</span>
                                                    <span>{clientPhone}</span>
                                                </div>
                                            )}
                                            {!agentPhone && !clientPhone && <span className="opacity-50">No Phone Data</span>}
                                        </div>
                                    </div>
                                </td>

                                {/* Duration */}
                                <td className="p-4 text-gray-300 font-mono">
                                    {call.call_duration_secs || call.call_duration_secs === 0
                                        ? `${Math.floor(call.call_duration_secs / 60)}m ${call.call_duration_secs % 60}s`
                                        : '0s'
                                    }
                                </td>

                                {/* Status */}
                                <td className="p-4">
                                    <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                    ${statusSuccess
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20'}
                  `}>
                                        {statusSuccess ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                        {call.status}
                                    </span>
                                </td>

                                {/* Recording */}
                                <td className="p-4 flex justify-center">
                                    <AudioPlayer
                                        src={audioSrc}
                                        isActive={activeAudioSrc === audioSrc}
                                        onPlay={() => setActiveAudioSrc(audioSrc)}
                                    />
                                </td>
                            </tr>
                        );
                    })}

                    {filteredCalls.length === 0 && (
                        <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                                No signals found for this frequency.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
