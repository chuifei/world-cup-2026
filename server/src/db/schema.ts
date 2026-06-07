import { getDb } from './connection'

export function createTables(): void {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      name_en TEXT,
      flag_code TEXT,
      confederation TEXT,
      fifa_rank INTEGER,
      group_name TEXT,
      coach_name TEXT,
      coach_nationality TEXT,
      coach_age INTEGER,
      coach_since TEXT,
      formation TEXT,
      data_status TEXT DEFAULT 'pending',
      qualification_status TEXT DEFAULT 'pending',
      world_cup_appearances INTEGER,
      best_result TEXT
    );

    CREATE TABLE IF NOT EXISTS team_tournament_stats (
      team_id TEXT PRIMARY KEY REFERENCES teams(id),
      points INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0,
      average_possession REAL DEFAULT 0,
      matches_played INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      team_id TEXT REFERENCES teams(id),
      name TEXT NOT NULL,
      number INTEGER,
      position TEXT,
      club TEXT,
      club_logo TEXT,
      age INTEGER,
      height INTEGER,
      weight INTEGER,
      nationality TEXT,
      flag_code TEXT,
      preferred_foot TEXT,
      market_value INTEGER,
      photo_url TEXT,
      birth_date TEXT,
      abilities TEXT,
      tournament_stats TEXT
    );

    CREATE TABLE IF NOT EXISTS club_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      player_id TEXT REFERENCES players(id),
      club_name TEXT NOT NULL,
      period TEXT,
      appearances INTEGER DEFAULT 0,
      goals INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS player_career_summary (
      player_id TEXT PRIMARY KEY REFERENCES players(id),
      first_appearance TEXT,
      total_caps INTEGER DEFAULT 0,
      total_goals INTEGER DEFAULT 0,
      major_tournaments TEXT
    );

    CREATE TABLE IF NOT EXISTS world_cup_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id TEXT REFERENCES teams(id),
      year INTEGER NOT NULL,
      result TEXT,
      host TEXT,
      matches_played INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      home_team_id TEXT REFERENCES teams(id),
      away_team_id TEXT REFERENCES teams(id),
      home_score INTEGER,
      away_score INTEGER,
      status TEXT NOT NULL DEFAULT 'pending',
      date TEXT NOT NULL,
      venue_id TEXT,
      city TEXT,
      group_name TEXT,
      round TEXT,
      half_time_home_score INTEGER,
      half_time_away_score INTEGER,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS match_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT REFERENCES matches(id),
      minute INTEGER NOT NULL,
      type TEXT NOT NULL,
      player_name TEXT NOT NULL,
      team TEXT NOT NULL,
      detail TEXT
    );

    CREATE TABLE IF NOT EXISTS match_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT UNIQUE REFERENCES matches(id),
      possession_home INTEGER,
      possession_away INTEGER,
      shots_home INTEGER,
      shots_away INTEGER,
      shots_on_target_home INTEGER,
      shots_on_target_away INTEGER,
      corners_home INTEGER,
      corners_away INTEGER,
      yellows_home INTEGER,
      yellows_away INTEGER,
      reds_home INTEGER,
      reds_away INTEGER,
      fouls_home INTEGER,
      fouls_away INTEGER
    );

    CREATE TABLE IF NOT EXISTS lineups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT REFERENCES matches(id),
      team TEXT NOT NULL,
      player_name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS standings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_name TEXT NOT NULL,
      team_id TEXT REFERENCES teams(id),
      rank INTEGER NOT NULL,
      played INTEGER DEFAULT 0,
      won INTEGER DEFAULT 0,
      drawn INTEGER DEFAULT 0,
      lost INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0,
      goal_difference INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      recent_form TEXT,
      data_status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT,
      country TEXT,
      capacity INTEGER,
      image_url TEXT,
      matches_count INTEGER DEFAULT 0,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS tournaments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year INTEGER NOT NULL,
      host TEXT,
      host_flag_code TEXT,
      champion TEXT,
      champion_flag_code TEXT,
      runner_up TEXT,
      runner_up_flag_code TEXT,
      third_place TEXT,
      third_place_flag_code TEXT,
      fourth_place TEXT,
      fourth_place_flag_code TEXT,
      top_scorer TEXT,
      top_scorer_goals INTEGER,
      best_player TEXT,
      best_player_note TEXT,
      best_goalkeeper TEXT,
      best_goalkeeper_note TEXT,
      total_goals INTEGER,
      total_matches INTEGER,
      total_attendance INTEGER,
      teams_count INTEGER
    );

    CREATE TABLE IF NOT EXISTS world_cup_records (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      detail TEXT,
      category TEXT
    );

    CREATE TABLE IF NOT EXISTS country_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      country_name TEXT NOT NULL,
      flag_code TEXT,
      appearances INTEGER DEFAULT 0,
      titles INTEGER DEFAULT 0,
      total_matches INTEGER DEFAULT 0,
      wins INTEGER DEFAULT 0,
      draws INTEGER DEFAULT 0,
      losses INTEGER DEFAULT 0,
      goals_for INTEGER DEFAULT 0,
      goals_against INTEGER DEFAULT 0,
      best_result TEXT
    );

    CREATE TABLE IF NOT EXISTS head_to_head (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_a_id TEXT REFERENCES teams(id),
      team_b_id TEXT REFERENCES teams(id),
      date TEXT NOT NULL,
      tournament TEXT,
      team_a_score INTEGER,
      team_b_score INTEGER
    );
    CREATE INDEX IF NOT EXISTS idx_head_to_head_teams ON head_to_head(team_a_id, team_b_id);

    CREATE TABLE IF NOT EXISTS predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id TEXT UNIQUE REFERENCES matches(id),
      home_win_prob REAL,
      draw_prob REAL,
      away_win_prob REAL,
      most_likely_score TEXT,
      second_likely_score TEXT,
      most_likely_score_prob REAL,
      second_likely_score_prob REAL,
      key_factors TEXT,
      home_rating TEXT,
      away_rating TEXT,
      home_recent_form TEXT,
      away_recent_form TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS user_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      match_id TEXT REFERENCES matches(id),
      predicted_home_score INTEGER NOT NULL,
      predicted_away_score INTEGER NOT NULL,
      predicted_result TEXT NOT NULL,
      confidence INTEGER DEFAULT 3,
      is_correct INTEGER,
      points_earned INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      settled_at TEXT,
      UNIQUE(user_id, match_id)
    );
  `)
}
