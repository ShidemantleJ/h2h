import { supabase } from "../db/supabase.js";

// If request has user, send to next point. If not, return 401 (unauthorized)
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

// If wcaid exists, add profile id. If profile id exists, add WCAid. Otherwise, the new user
// will be inserted into the users table.
async function findOrCreateUser(user) {
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        name: user.displayName,
        profile_id: user.id,
        wcaid: user?.wca.id,
        profile_pic_url: user.photos[0].value,
      },
      { onConflict: ["wcaid"] }
    )
    .select()
    .single();
  const { data: data2, error: error2 } = await supabase
    .from("users")
    .upsert(
      {
        name: user.displayName,
        profile_id: user.id,
        wcaid: user?.wca.id,
        profile_pic_url: user.photos[0].value,
      },
      { onConflict: ["profile_id"] }
    )
    .select()
    .single();

  console.error(error, error2);
  return data || data2;
}

export { findOrCreateUser, isLoggedIn };
