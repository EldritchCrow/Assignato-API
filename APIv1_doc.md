# API v1 Docs

`/get_login_link`
Verb: GET
Returns: {
    "url": "Google OAuth Link"
}
Following the OAuth link will take you to a page that stores the access token in a cookie and then redirects to the main page

All following items should also have a query paramter named "token" whose value is equal to the OAuth access token.

`/add_room`
Verb: POST
Body: {
    "department": "N letter department prefix used to lock down rooms to set of courses. Can be 'any'",
    "building": "Building name",
    "number": "Room number in the building (string, e.g. 1200A)",
    "capacity": "Amount of people it can fit (number)",
    "features": [
        "valid_JSON_key",
        "List of boolean features, like projector or movable desks"
    ]
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
}

`/add_professor`
Verb: POST
Body: {
    "department": "N letter department prefix. Used in later versions for building preference",
    "name": "Professor name"
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
}

`/add_class`
Verb: POST
Body: {
    "professor_name": "Name of professor teaching the course",
    "size": "Max number of people in the course (integer)",
    "title": "Title of the course"
    "section": "Section number (integer). 0 indicates co-occurent sections scheduled separately",
    "duration": "Duration in minutes (integer)",
    "department": [
        "N letter prefix",
        "Used for optional room restrictions"
    ],
    "crn": "User input artificial key. Must be 0 if section is 0 (integer)",
    "requirements": [
        "valid_JSON_key",
        "List of necessary features, per /add_room"
    ]
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
}

`/add_item`
Verb: POST
Description: Genericized schedulable item with time restrictions (e.g. club meetings)
Body: {
    "title": "Name of schedule item (must be unique)",
    "duration": "Duration in minutes (integer)",
    "requirements": [
        "valid_JSON_key",
        "List of necessary features, per /add_room"
    ],
    "size": "Number of attending people (integer)",
    "range": {
        "start": "Earliest possible time of day (integer, military time, e.g. 1400)",
        "end": "Lastest possible time of day (same as above)"
    },
    "prefs": [
        {
            "building": "Building name",
            "number": "Room number" 
        }
    ]
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
}

`/add_constraint`
Verb: POST
Description: Add a type of constraint to a subset of registration items
Body: {
    "type": "One of a predefined list of constraint types",
    "apply_to": "A predfined slice of database items (e.g. 'class' or 'item'), a CRN, or 'all' (string)",
    "weight": "log scale weighting, where 0.0 has no impact and 1.0 has maximum impact (float)"
    "options": {
        "type_defined_params": "additional arguments as determined by the constraint type"
    }
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
}

`/get_constraints`
Verb: GET
Description: Returns a list of constraints with optional search filters. Listed href args are optional.
href args: {
    "crn": "CRN number (integer)",
    "title": "Course title",
    "name": "Professor name",
    "type": "Type of constraint"
}
Returns: {
    "constraints": [
        {
            "id": "Constraint's artificial key"
            "type": "Constraint type",
            "apply_to": "Constraint scope",
            "weight": "Constraint significance"
        }
    ]
}

`/remove_constraint`
Verb: POST
Description: Remove a certain constraint
Body: {
    "id": "Provided aritificial key from /get_constraints"
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
}

`/assign`
Verb: POST
Description: Makes a fixed assignment that cannot be changed by the algorithm
Body: {
    "crn": "Unique CRN for assigning a class",
    "title": "Unique title for assigning an item. Having this param is mutually exclusive with crn",
    "building": "Assigned building"
    "room": "Assigned room number"
    "start": "The start time. The class/item duration will be retrieved from the existing database object"
    "professor": "Assigned professor. Can be blank if adding an item"
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
}

`/remove`
Verb: POST
Description: Removes a registerable object given an identifier
Body: {
    "crn": "Unique CRN for assigning a class",
    "title": "Unique title for assigning an item. Having this param is mutually exclusive with crn"
    "name": "Professor name. Having this param is mutually exclusive with the above two params",
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
}

`/remove_assignment`
Verb: POST
Description: Removes a fixed assignment given sufficient identifiers
Body: {
    "crn": "Unique CRN for assigning a class",
    "title": "Unique title for assigning an item. Having this param is mutually exclusive with crn"
    "name": "Professor name. Having this param is mutually exclusive with the above two params",
    "day": "The day of the assignment"
    "time": "The start time of the assignment"
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
}

`/generate_reports`
Verb: POST
Description:
Tells the server to begin generating the scheduling reports
If a report is being run, it will return the existing ID
If a report has been run but has not been viewed yet, it will return the existing ID
Body: {
    "types": [
        "Possible predefined types of possible reports",
    ]
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false",
    "reports": [
        {
            "id": "Unique identifier, used in other methods",
            "type": "The type of report generated"
        }
    ]
}

`/get_report_data`
Verb: GET
Description:
Return a given page of report data
Data contains more user-friendly content than is stored in the backend
Raw data is only available through report downloads
If the thread running the business logic is not complete,
    success will be false and an error message will specify that the job is still in progress
Params: {
    "id": "One of the given ids",
    "page": "Page number"
    "per_page": "Number of items per page"
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false",
    "data": [
        {
            "class": "Class name",
            "item": "Item name, mutually exclusive with above",
            "building": "The building where the item is scheduled"
            "room": "Room number where the item is scheduled"
            "prof": "Professor teaching the course (can be empty)"
            "times": [
                {
                    "day": "Day of the course",
                    "start": "Start time of the course",
                    "end": "End time of the course"
                }
            ]
        }
    ]
}

`/get_time_grid`
Verb: GET
Description: Retrieves the information to visualize a time grid for a given professor or room
Params: {
    "id": "The provided report id",
    "building": "The building of the room to display"
    "room": "The room number to display
    "prof": "Professor identifier. Mutually exclusive with building and room"
}
Returns: {
    "data": [
        {
            "class": "Class name",
            "item": "Item name, mutually exclusive with above",
            "building": "The building where the item is scheduled"
            "room": "Room number where the item is scheduled"
            "prof": "Professor teaching the course (can be empty)"
            "times": [
                {
                    "day": "Day of the course",
                    "start": "Start time of the course",
                    "end": "End time of the course"
                }
            ]
        }
    ]
}

`/download_report`
Endpoint not yet defined