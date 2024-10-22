# API v1 Docs

`/get_login_link`
Verb: GET
Returns: {
    "url": "Google OAuth Link"
}
Following the OAuth link will take you to a page that stores the access token in a cookie and then redirects to the main page


`/decode_oauth`
Verb: GET
Params: {
    "code": "The code provided by the OAuth validation return"
}
Returns: {
    "token": "The resultant authentication token"
}

`/cas_auth`
Verb: GET
Params: {
    "cas_url": "User input url for the CAS authentication, minus the https:// part",
    "callback": "Where the endpoint should redirect to once authenticated. A 'token' param will be in the href args"
}
Returns: {
    "success": false,
    "message": "Error message",
}
OR REDIRECTS TO CALLBACK PAGE ON SUCCESS

All following items should also have a query paramter named "token" whose value is equal to the OAuth access token.

`/get_share_code`
Verb: GET
Returns: {
    "success": true|false,
    "message": "The success/error message as applicable",
    "code": "The user's 10 character share code or whatever the one is they set"
}

`/set_share_code`
Verb: POST
Body: {
    "code": "The share code the user wishes to set"
}
Returns: {
    "success": true|false,
    "message": "The success/error message as applicable"
}
Note: This is a destructive operation. The user's current input items will be irretrievable except by other users with this share code.

`/reset_share_code`
Verb: POST
Returns: {
    "success": true|false,
    "message": "The success/error message as applicable"
}
Note: This is a destructive operation. The user's current input items will be irretrievable except by other users with this share code.

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
    "title": "Title of the course",
    "section": "Section number (integer). 0 indicates co-occurent sections scheduled simultaneously",
    "duration": "Duration in minutes (integer)",
    "department": [
        "N letter prefix",
        "Used for optional room restrictions"
    ],
    "crn": "User input artificial key (integer)",
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
    "size": "Number of attending people (integer)"
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
    "crn": "Unique CRN for assigning a class (integer)",
    "title": "Unique title for assigning an item. Having this param is mutually exclusive with crn",
    "building": "Assigned building",
    "room": "Assigned room number",
    "day": "Day of the assignment",
    "start": "The start time. The class/item duration will be retrieved from the existing database object"
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
    "title": "Unique title for assigning an item. Having this param is mutually exclusive with crn",
    "name": "Professor name. Having this param is mutually exclusive with the above two params",
    "building": "The name of the building holding the room to remove. Mutually exclusive with the above",
    "number": "The room number of the room to remove. Must be present if and only if building is"
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
}

`/get_type`
Verb: GET
Description: Gets user-entered documents of a type
href args: {
    "type": "The type of object to retrieve. Must be 'class', 'item', 'room', or 'professor'",
    "page": "Page number (integer)",
    "per_page": "Number of items per page (integer)"
}
Returns: {
    "success": true|false,
    "message": "Error message if 'success' was false"
    "data": [
        {
            "The database items as they appear in the schema": "value"
        }
    ]
}

`/edit_type`
Verb: POST
Description: Edits a user-entered document
Body: {
    "crn": "Unique CRN for assigning a class",
    "title": "Unique title for assigning an item. Having this param is mutually exclusive with crn",
    "name": "Professor name. Having this param is mutually exclusive with the above two params",
    "building": "The name of the building holding the room to remove. Mutually exclusive with the above",
    "number": "The room number of the room to remove. Must be present if and only if building is",
    "fields": {
        "Valid fields for the specified document": "value"
    }
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
    "title": "Unique title for assigning an item. Having this param is mutually exclusive with crn",
    "building": "Assigned building",
    "room": "Assigned room number",
    "day": "The day of the assignment"
    "start": "The start time of the assignment (integer)"
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
    "page": "Page number (integer)",
    "per_page": "Number of items per page (integer)"
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
    "building": "The building of the room to display",
    "room": "The room number to display",
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