import { isSupabaseConfigured, supabase } from "../lib/supabase";

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error("Parent Library is not connected yet.");
  }

  return supabase;
}

export async function getParentSession() {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export async function getParentProfile() {
  const client = requireSupabase();
  const { data: sessionData, error: sessionError } =
    await client.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const userId = sessionData.session?.user?.id;
  if (!userId) {
    return null;
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function signInParent(email, password) {
  const client = requireSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  const profile = await getParentProfile();

  if (!profile || !["admin", "editor"].includes(profile.role)) {
    await client.auth.signOut();
    throw new Error("This account cannot edit learning content.");
  }

  return {
    profile,
    session: data.session,
  };
}

export async function signOutParent() {
  const client = requireSupabase();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export function subscribeToParentAuth(callback) {
  if (!supabase) {
    callback(null);
    return () => {};
  }

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return () => subscription.unsubscribe();
}

