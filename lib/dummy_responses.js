

module.exports = {
    default_post: {
        success: true,
        message: "Operation performed successfully"
    },
    default_constraints: {
        constraints: [
            {
                id: "abc123",
                type: "RoomTime",
                apply_to: "class",
                weight: 1.0
            },
            {
                id: "321cba",
                type: "RoomTime",
                apply_to: "item",
                weight: 0.1
            }
        ]
    },
    default_report_gen: {
        success: true,
        message: "Operation performed successfully",
        reports: [
            {
                id: "abcdef",
                type: "strict"
            },
            {
                id: "fedcba",
                type: "prefer previous"
            }
        ]
    },
    default_report_data: {
        success: true,
        message: "Operation performed successfully",
        data: [
            {
                class: "ITWS 4500-01: Web Science Systems Development",
                building: "Sage Labs",
                room: "5510",
                prof: "Dr. Callahan",
                times: [
                    {
                        day: "Tuesday",
                        start: 1200,
                        end: 1350
                    },
                    {
                        day: "Friday",
                        start: 1200,
                        end: 1350
                    }
                ]
            },
            {
                class: "CSCI 4380: Database Systems",
                building: "DCC",
                room: "318",
                prof: "Prof S. Johnson",
                times: [
                    {
                        day: "Monday",
                        start: 1600,
                        end: 1750
                    },
                    {
                        day: "Thursday",
                        start: 1600,
                        end: 1750
                    }
                ]
            }
        ]
    },
    default_timegrid_data: {
        data: [
            {
                class: "ITWS 4500-01: Web Science Systems Development",
                building: "Sage Labs",
                room: "5510",
                prof: "Dr. Callahan",
                times: [
                    {
                        day: "Tuesday",
                        start: 1200,
                        end: 1350
                    },
                    {
                        day: "Friday",
                        start: 1200,
                        end: 1350
                    }
                ]
            },
            {
                class: "CSCI 4380: Database Systems",
                building: "DCC",
                room: "318",
                prof: "Prof S. Johnson",
                times: [
                    {
                        day: "Monday",
                        start: 1600,
                        end: 1750
                    },
                    {
                        day: "Thursday",
                        start: 1600,
                        end: 1750
                    }
                ]
            }
        ]
    }
}