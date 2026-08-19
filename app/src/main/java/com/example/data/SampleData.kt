package com.example.data

import com.example.model.*

object SampleData {
    val initialTeams = listOf(
        Team(
            id = "team-1",
            name = "Dhaka Kings",
            shortName = "DHK",
            logoUrl = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=150&auto=format&fit=crop&q=80",
            primaryColorHex = 0xFFD32F2F,
            totalBudget = 180.0,
            city = "Dhaka",
            coach = "Julian Alva"
        ),
        Team(
            id = "team-2",
            name = "Chittagong Mariners",
            shortName = "CTG",
            logoUrl = "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=150&auto=format&fit=crop&q=80",
            primaryColorHex = 0xFF1976D2,
            totalBudget = 160.0,
            city = "Chittagong",
            coach = "Marco Silva"
        ),
        Team(
            id = "team-3",
            name = "Sylhet Strikers",
            shortName = "SYL",
            logoUrl = "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=150&auto=format&fit=crop&q=80",
            primaryColorHex = 0xFF388E3C,
            totalBudget = 140.0,
            city = "Sylhet",
            coach = "Kazi Salahuddin"
        ),
        Team(
            id = "team-4",
            name = "Rajshahi Royals",
            shortName = "RAJ",
            logoUrl = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=150&auto=format&fit=crop&q=80",
            primaryColorHex = 0xFF7B1FA2,
            totalBudget = 130.0,
            city = "Rajshahi",
            coach = "Enzo Martinez"
        )
    )

    val initialPlayers = listOf(
        // Dhaka Kings (team-1)
        Player(
            id = "p-101",
            teamId = "team-1",
            name = "Tariqul Islam (GK)",
            jerseyNumber = 1,
            position = Position.GOALKEEPER,
            photoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 12.5,
            nationality = "Bangladesh",
            saves = 28,
            matchesPlayed = 6
        ),
        Player(
            id = "p-102",
            teamId = "team-1",
            name = "Mahmudul Hasan",
            jerseyNumber = 4,
            position = Position.DEFENDER,
            photoUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 18.0,
            nationality = "Bangladesh",
            yellowCards = 3,
            fouls = 9,
            matchesPlayed = 6
        ),
        Player(
            id = "p-103",
            teamId = "team-1",
            name = "Jamal Bhuyan (C)",
            jerseyNumber = 8,
            position = Position.MIDFIELDER,
            photoUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 35.0,
            nationality = "Bangladesh",
            goals = 2,
            assists = 5,
            yellowCards = 1,
            fouls = 7,
            matchesPlayed = 6
        ),
        Player(
            id = "p-104",
            teamId = "team-1",
            name = "Rakib Hossain",
            jerseyNumber = 10,
            position = Position.FORWARD,
            photoUrl = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 42.0,
            nationality = "Bangladesh",
            goals = 7,
            assists = 3,
            yellowCards = 1,
            fouls = 4,
            matchesPlayed = 6
        ),
        Player(
            id = "p-105",
            teamId = "team-1",
            name = "Shekh Morsalin",
            jerseyNumber = 11,
            position = Position.FORWARD,
            photoUrl = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 38.5,
            nationality = "Bangladesh",
            goals = 5,
            assists = 4,
            yellowCards = 0,
            fouls = 3,
            matchesPlayed = 6
        ),

        // Chittagong Mariners (team-2)
        Player(
            id = "p-201",
            teamId = "team-2",
            name = "Anisur Rahman Zico (GK)",
            jerseyNumber = 1,
            position = Position.GOALKEEPER,
            photoUrl = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 20.0,
            nationality = "Bangladesh",
            saves = 34,
            matchesPlayed = 6
        ),
        Player(
            id = "p-202",
            teamId = "team-2",
            name = "Topu Barman",
            jerseyNumber = 5,
            position = Position.DEFENDER,
            photoUrl = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 28.0,
            nationality = "Bangladesh",
            goals = 2,
            yellowCards = 2,
            fouls = 11,
            matchesPlayed = 6
        ),
        Player(
            id = "p-203",
            teamId = "team-2",
            name = "Sohel Rana",
            jerseyNumber = 7,
            position = Position.MIDFIELDER,
            photoUrl = "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 25.0,
            nationality = "Bangladesh",
            goals = 3,
            assists = 4,
            yellowCards = 2,
            fouls = 8,
            matchesPlayed = 6
        ),
        Player(
            id = "p-204",
            teamId = "team-2",
            name = "Dorielton Gomez",
            jerseyNumber = 9,
            position = Position.FORWARD,
            photoUrl = "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 45.0,
            nationality = "Brazil",
            goals = 8,
            assists = 2,
            yellowCards = 1,
            redCards = 0,
            fouls = 5,
            matchesPlayed = 6
        ),

        // Sylhet Strikers (team-3)
        Player(
            id = "p-301",
            teamId = "team-3",
            name = "Mitul Marma (GK)",
            jerseyNumber = 22,
            position = Position.GOALKEEPER,
            photoUrl = "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 14.0,
            nationality = "Bangladesh",
            saves = 22,
            matchesPlayed = 5
        ),
        Player(
            id = "p-302",
            teamId = "team-3",
            name = "Bishwanath Ghosh",
            jerseyNumber = 2,
            position = Position.DEFENDER,
            photoUrl = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 19.5,
            nationality = "Bangladesh",
            yellowCards = 4,
            redCards = 1,
            fouls = 14,
            matchesPlayed = 5
        ),
        Player(
            id = "p-303",
            teamId = "team-3",
            name = "Robinho Robson",
            jerseyNumber = 10,
            position = Position.FORWARD,
            photoUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 48.0,
            nationality = "Brazil",
            goals = 6,
            assists = 6,
            yellowCards = 2,
            fouls = 6,
            matchesPlayed = 5
        ),

        // Rajshahi Royals (team-4)
        Player(
            id = "p-401",
            teamId = "team-4",
            name = "Sujon Hossain (GK)",
            jerseyNumber = 1,
            position = Position.GOALKEEPER,
            photoUrl = "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 10.0,
            nationality = "Bangladesh",
            saves = 19,
            matchesPlayed = 5
        ),
        Player(
            id = "p-402",
            teamId = "team-4",
            name = "Rahmat Mia",
            jerseyNumber = 3,
            position = Position.DEFENDER,
            photoUrl = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 16.0,
            nationality = "Bangladesh",
            yellowCards = 3,
            fouls = 10,
            matchesPlayed = 5
        ),
        Player(
            id = "p-403",
            teamId = "team-4",
            name = "Foysal Ahmed Fahim",
            jerseyNumber = 11,
            position = Position.FORWARD,
            photoUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            purchasePrice = 26.0,
            nationality = "Bangladesh",
            goals = 4,
            assists = 2,
            yellowCards = 1,
            fouls = 5,
            matchesPlayed = 5
        )
    )

    val initialEvents = listOf(
        MatchEvent(
            id = "ev-1",
            matchId = "match-1",
            type = EventType.GOAL,
            minute = 18,
            teamId = "team-1",
            playerId = "p-104",
            playerName = "Rakib Hossain",
            assistPlayerId = "p-103",
            assistPlayerName = "Jamal Bhuyan (C)",
            note = "Clinical low finish into bottom-left corner after pinpoint through ball"
        ),
        MatchEvent(
            id = "ev-2",
            matchId = "match-1",
            type = EventType.YELLOW_CARD,
            minute = 32,
            teamId = "team-2",
            playerId = "p-202",
            playerName = "Topu Barman",
            note = "Late sliding challenge breaking up a quick counter-attack"
        ),
        MatchEvent(
            id = "ev-3",
            matchId = "match-1",
            type = EventType.FOUL,
            minute = 41,
            teamId = "team-1",
            playerId = "p-102",
            playerName = "Mahmudul Hasan",
            note = "High boot foul near the defensive penalty box"
        ),
        MatchEvent(
            id = "ev-4",
            matchId = "match-1",
            type = EventType.GOAL,
            minute = 54,
            teamId = "team-2",
            playerId = "p-204",
            playerName = "Dorielton Gomez",
            assistPlayerId = "p-203",
            assistPlayerName = "Sohel Rana",
            note = "Bullet header off an inswinging corner kick"
        ),
        MatchEvent(
            id = "ev-5",
            matchId = "match-1",
            type = EventType.SAVE,
            minute = 68,
            teamId = "team-1",
            playerId = "p-101",
            playerName = "Tariqul Islam (GK)",
            note = "Sensational fingertip reflex save to deny a 25-yard curling strike"
        ),
        MatchEvent(
            id = "ev-6",
            matchId = "match-1",
            type = EventType.GOAL,
            minute = 76,
            teamId = "team-1",
            playerId = "p-105",
            playerName = "Shekh Morsalin",
            assistPlayerId = "p-104",
            assistPlayerName = "Rakib Hossain",
            note = "Spectacular volley from outside the 18-yard box into the top-right corner"
        )
    )

    val initialMatches = listOf(
        Match(
            id = "match-1",
            homeTeamId = "team-1",
            awayTeamId = "team-2",
            homeScore = 2,
            awayScore = 1,
            status = MatchStatus.LIVE_2ND_HALF,
            currentMinute = 79,
            addedMinutes = 4,
            isClockRunning = true,
            venue = "Bangabandhu National Stadium, Dhaka",
            matchDate = "Today, 19:30",
            round = "Super League Matchday 7 (Derby)",
            matchStoryNotes = "🔥 Fierce rivalry clash! Dhaka Kings started on the front foot with Rakib Hossain scoring in the 18th minute. Chittagong Mariners fought back with a Dorielton Gomez header in the second half. Morsalin's screamer in the 76th minute has ignited the crowd with Dhaka holding a 2-1 advantage entering the final 10 minutes!",
            events = initialEvents
        ),
        Match(
            id = "match-2",
            homeTeamId = "team-3",
            awayTeamId = "team-4",
            homeScore = 3,
            awayScore = 1,
            status = MatchStatus.FINISHED,
            currentMinute = 90,
            addedMinutes = 3,
            isClockRunning = false,
            venue = "Sylhet District Stadium",
            matchDate = "Yesterday, 16:00",
            round = "Super League Matchday 6",
            matchStoryNotes = "Robinho Robson put on a masterclass with a goal and 2 assists as Sylhet Strikers comfortably secured 3 points at home over Rajshahi Royals.",
            events = listOf(
                MatchEvent(
                    id = "ev-201",
                    matchId = "match-2",
                    type = EventType.GOAL,
                    minute = 14,
                    teamId = "team-3",
                    playerId = "p-303",
                    playerName = "Robinho Robson",
                    note = "Curled freekick over the wall"
                ),
                MatchEvent(
                    id = "ev-202",
                    matchId = "match-2",
                    type = EventType.GOAL,
                    minute = 51,
                    teamId = "team-4",
                    playerId = "p-403",
                    playerName = "Foysal Ahmed Fahim",
                    note = "Rebound tap-in"
                )
            )
        ),
        Match(
            id = "match-3",
            homeTeamId = "team-1",
            awayTeamId = "team-3",
            homeScore = 0,
            awayScore = 0,
            status = MatchStatus.UPCOMING,
            currentMinute = 0,
            addedMinutes = 0,
            isClockRunning = false,
            venue = "Bashundhara Kings Arena, Dhaka",
            matchDate = "Tomorrow, 20:00",
            round = "Super League Matchday 8",
            matchStoryNotes = "High-stakes table top encounter between Dhaka Kings and Sylhet Strikers. Both coaches are expecting a tactical masterclass.",
            events = emptyList()
        )
    )
}
