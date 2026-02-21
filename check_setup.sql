-- Check if function exists
SELECT proname, prosrc FROM pg_proc WHERE proname = 'handle_new_user';

-- Check if trigger exists
SELECT tgname FROM pg_trigger WHERE tgname = 'on_auth_user_created';
