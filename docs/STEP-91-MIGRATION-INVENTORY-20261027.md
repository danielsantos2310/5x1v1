# Step 91 — Read-only linked migration inventory
Verified October 27, 2026 against linked Supabase project utlarxjtwzcvyklbmksb. No schema changes made.

| GitHub file prefix | Supabase applied version | Migration |
|---|---|---|
| 202610150001 | 20261015170901 | move_authorization_helpers_to_private_schema |
| 202610150002 | 20261015171141 | restrict_public_table_api_privileges |
| 202610150003 | 20261015171323 | index_foreign_key_relationships |
| 202610150004 | 20261015171854 | club_team_event_management_policies |
| 202610150005 | 20261015172014 | rsvp_capacity_waitlist_v1 |
| 202610150006 | 20261015172028 | allow_trigger_assigned_waitlist_in_rsvp_policy |
| 202610150007 | 20261015172251 | attendance_authorization_and_audit |
| 202610150008 | 20261015172316 | notification_inbox_and_participation_view |
| 202610150009 | 20261015172328 | correct_attendance_reporting_independent_rsvps |
| 202610150010 | 20261015172434 | rsvp_admin_coach_read_for_reports |
| 202610150011 | 20261015172650 | capacity_invariants_and_notification_queue |
| 202610150012 | 20261015172731 | cache_auth_uid_in_rls_policies |
| 202610150013 | 20261015172933 | promote_waitlist_on_capacity_increase |
| 202610150014 | 20261015173021 | automatic_updated_at_columns |
| 202610150015 | 20261015173035 | event_updates_cancelled_notification_queue |
| 202610150016 | 20261015173420 | fix_coach_attendance_membership_rls |
| 202610150017 | 20261015173614 | prevent_last_admin_lockout |
| 202610150018 | 20261015173733 | combine_rsvp_select_policies |

The earlier 202610140001 foundation file was created from the initial manually configured schema and is NOT part of linked migration history.
The new 202610270001_event_attendance_roster.sql is NOT applied; event_attendance_roster function was not present at inventory time.

## Gate before deploying
1. Back up current database and inspect schema for drift. Confirm migration file SQL matches the recorded linked migrations.
2. Reproduce foundation and applied migrations on isolated staging and run schema comparisons.
3. Decide documented migration baseline and reconcile history with supported Supabase CLI methods; never manually edit supabase_migrations.
4. Apply Step 90 migration in isolated staging, review SECURITY DEFINER authorization and run team/club role-matrix browser tests.
5. Confirm absent anon execution and allowed authenticated execution from step91_roster_privileges.sql.
6. Only then approve linked project deployment and check authenticated `/live` roster flows.

Do not run supabase db push blindly. No production data modified in Step 91.