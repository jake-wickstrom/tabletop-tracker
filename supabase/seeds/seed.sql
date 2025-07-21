-- Seed data for tabletop tracker
-- This file contains sample data to populate the database

-- Insert sample games
INSERT INTO games (name, description, min_players, max_players, estimated_playtime_minutes, complexity_rating) VALUES
('Catan', 'A strategy board game where players collect resources and build settlements', 3, 4, 90, 3),
('Ticket to Ride', 'A railway-themed board game where players collect train cards to claim railway routes', 2, 5, 60, 2),
('Pandemic', 'A cooperative board game where players work together to stop the spread of diseases', 2, 4, 45, 3),
('Carcassonne', 'A tile-placement game where players build the landscape of a medieval fortress', 2, 5, 45, 2),
('Settlers of Catan', 'A strategy board game where players collect resources and build settlements', 3, 4, 90, 3);

-- Insert sample players
INSERT INTO players (name, email) VALUES
('Alice Johnson', 'alice.johnson@example.com'),
('Bob Smith', 'bob.smith@example.com'),
('Carol Davis', 'carol.davis@example.com'),
('David Wilson', 'david.wilson@example.com'),
('Eve Brown', 'eve.brown@example.com');

-- Insert sample game sessions
INSERT INTO game_sessions (game_id, session_date, location, notes) VALUES
((SELECT id FROM games WHERE name = 'Catan' LIMIT 1), '2024-01-15', 'Game Night at Alice''s', 'Great game! Bob won with longest road'),
((SELECT id FROM games WHERE name = 'Ticket to Ride' LIMIT 1), '2024-01-20', 'Local Game Store', 'First time playing for Carol and David'),
((SELECT id FROM games WHERE name = 'Pandemic' LIMIT 1), '2024-01-25', 'Bob''s House', 'We lost but had fun trying to save the world'),
((SELECT id FROM games WHERE name = 'Carcassonne' LIMIT 1), '2024-02-01', 'Carol''s Apartment', 'Quick game before dinner'),
((SELECT id FROM games WHERE name = 'Catan' LIMIT 1), '2024-02-05', 'Game Night at Alice''s', 'Eve joined us for the first time');

-- Insert session players
INSERT INTO session_players (session_id, player_id, player_order) VALUES
((SELECT id FROM game_sessions WHERE session_date = '2024-01-15' LIMIT 1), (SELECT id FROM players WHERE name = 'Alice Johnson' LIMIT 1), 1),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-15' LIMIT 1), (SELECT id FROM players WHERE name = 'Bob Smith' LIMIT 1), 2),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-15' LIMIT 1), (SELECT id FROM players WHERE name = 'Carol Davis' LIMIT 1), 3),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-20' LIMIT 1), (SELECT id FROM players WHERE name = 'Carol Davis' LIMIT 1), 1),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-20' LIMIT 1), (SELECT id FROM players WHERE name = 'David Wilson' LIMIT 1), 2),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-20' LIMIT 1), (SELECT id FROM players WHERE name = 'Alice Johnson' LIMIT 1), 3),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-25' LIMIT 1), (SELECT id FROM players WHERE name = 'Bob Smith' LIMIT 1), 1),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-25' LIMIT 1), (SELECT id FROM players WHERE name = 'Carol Davis' LIMIT 1), 2),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-25' LIMIT 1), (SELECT id FROM players WHERE name = 'David Wilson' LIMIT 1), 3),
((SELECT id FROM game_sessions WHERE session_date = '2024-02-01' LIMIT 1), (SELECT id FROM players WHERE name = 'Carol Davis' LIMIT 1), 1),
((SELECT id FROM game_sessions WHERE session_date = '2024-02-01' LIMIT 1), (SELECT id FROM players WHERE name = 'David Wilson' LIMIT 1), 2),
((SELECT id FROM game_sessions WHERE session_date = '2024-02-05' LIMIT 1), (SELECT id FROM players WHERE name = 'Alice Johnson' LIMIT 1), 1),
((SELECT id FROM game_sessions WHERE session_date = '2024-02-05' LIMIT 1), (SELECT id FROM players WHERE name = 'Bob Smith' LIMIT 1), 2),
((SELECT id FROM game_sessions WHERE session_date = '2024-02-05' LIMIT 1), (SELECT id FROM players WHERE name = 'Eve Brown' LIMIT 1), 3);

-- Insert game results
INSERT INTO game_results (session_id, player_id, score, position, is_winner, notes) VALUES
((SELECT id FROM game_sessions WHERE session_date = '2024-01-15' LIMIT 1), (SELECT id FROM players WHERE name = 'Alice Johnson' LIMIT 1), 8, 2, FALSE, 'Good strategy but Bob got longest road'),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-15' LIMIT 1), (SELECT id FROM players WHERE name = 'Bob Smith' LIMIT 1), 10, 1, TRUE, 'Won with longest road bonus'),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-15' LIMIT 1), (SELECT id FROM players WHERE name = 'Carol Davis' LIMIT 1), 6, 3, FALSE, 'First time playing, learning the ropes'),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-20' LIMIT 1), (SELECT id FROM players WHERE name = 'Carol Davis' LIMIT 1), 87, 1, TRUE, 'Completed longest route'),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-20' LIMIT 1), (SELECT id FROM players WHERE name = 'David Wilson' LIMIT 1), 65, 2, FALSE, 'Almost completed the route'),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-20' LIMIT 1), (SELECT id FROM players WHERE name = 'Alice Johnson' LIMIT 1), 45, 3, FALSE, 'Had trouble getting the right cards'),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-25' LIMIT 1), (SELECT id FROM players WHERE name = 'Bob Smith' LIMIT 1), NULL, NULL, FALSE, 'Team lost - too many outbreaks'),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-25' LIMIT 1), (SELECT id FROM players WHERE name = 'Carol Davis' LIMIT 1), NULL, NULL, FALSE, 'Team lost - too many outbreaks'),
((SELECT id FROM game_sessions WHERE session_date = '2024-01-25' LIMIT 1), (SELECT id FROM players WHERE name = 'David Wilson' LIMIT 1), NULL, NULL, FALSE, 'Team lost - too many outbreaks'),
((SELECT id FROM game_sessions WHERE session_date = '2024-02-01' LIMIT 1), (SELECT id FROM players WHERE name = 'Carol Davis' LIMIT 1), 78, 1, TRUE, 'Built the largest city'),
((SELECT id FROM game_sessions WHERE session_date = '2024-02-01' LIMIT 1), (SELECT id FROM players WHERE name = 'David Wilson' LIMIT 1), 65, 2, FALSE, 'Good farmer strategy'),
((SELECT id FROM game_sessions WHERE session_date = '2024-02-05' LIMIT 1), (SELECT id FROM players WHERE name = 'Alice Johnson' LIMIT 1), 9, 1, TRUE, 'Largest army and longest road'),
((SELECT id FROM game_sessions WHERE session_date = '2024-02-05' LIMIT 1), (SELECT id FROM players WHERE name = 'Bob Smith' LIMIT 1), 7, 2, FALSE, 'Good resource management'),
((SELECT id FROM game_sessions WHERE session_date = '2024-02-05' LIMIT 1), (SELECT id FROM players WHERE name = 'Eve Brown' LIMIT 1), 5, 3, FALSE, 'First time playing, did well!'); 