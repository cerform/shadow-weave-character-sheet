-- Добавляем уникальное ограничение для fog_of_war чтобы upsert работал
CREATE UNIQUE INDEX IF NOT EXISTS fog_of_war_unique_cell 
ON fog_of_war(session_id, map_id, grid_x, grid_y);