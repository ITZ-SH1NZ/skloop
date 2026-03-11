import { createClient } from '@supabase/supabase-js';
import { loadEnvConfig } from '@next/env';

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLeaderboard() {
    console.log("Fetching a profile ID...");
    const { data: profiles, error: profileErr } = await supabase.from('profiles').select('id').limit(1);
    if (profileErr) {
        console.error("Profile fetch error:", profileErr);
        return;
    }
    if (!profiles || profiles.length === 0) {
        console.log("No profiles found.");
        return;
    }

    const userId = profiles[0].id;
    console.log(`Testing with userId: ${userId}`);

    const { data: connections, error: connError } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    console.log("connError:", connError);
    console.log("Connections length:", connections?.length);

    const friendIds = new Set(connections?.map(c => c.requester_id === userId ? c.recipient_id : c.requester_id) || []);
    friendIds.add(userId);

    console.log("Friend IDs array:", Array.from(friendIds));

    const { data: friendsProfiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, xp, coins, streak')
        .in('id', Array.from(friendIds))
        .order('xp', { ascending: false });

    console.log("profilesError:", profilesError);
    console.log("friendsProfiles length:", friendsProfiles?.length);
    if (friendsProfiles && friendsProfiles.length > 0) {
        console.log("First friend profile:", friendsProfiles[0]);
    }
}

checkLeaderboard().catch(console.error);
