

class Constraint {
    constructor(apply_to, weight) {
        this.apply_to = apply_to;
        this.weight = weight;
    }
    appliesTo(assign) {
        if (this.apply_to == 'all')
            return true;
        if (this.apply_to == "class" && assign.crn == undefined)
            return false;
        if (this.apply_to == "item" && assign.crn != undefined)
            return false;
        if (this.apply_to === parseInt(this.apply_to) && parseInt(assign.crn) != this.apply_to)
            return false;
        return true;
    }
    evaluate(assign) {
        if (!this.appliesTo(this.apply_to, assign))
            return 0.0;
        return Math.pow(this.weight * 10, 10);
    }
}

class ZeroConstraint extends Constraint {
    constructor(apply_to, weight) {
        this.apply_to = "all";
        this.weight = 0.0;
    }
    evaluate(assign) {
        return 0.0;
    }
}

class TimeConstraint extends Constraint {
    constructor(apply_to, weight, opts) {
        super(apply_to, weight);
        this.min_time = opts.min_time;
        this.max_time = opts.max_time;
    }
    evaluate(assign) {
        if (!this.appliesTo(assign))
            return 0.0;
        var dist = Math.abs(this.min_time - assign.start) / 100;
        return Math.pow(this.weight * 10, 10) * dist;
    }
}

class BuildingConstraint extends Constraint {
    constructor(apply_to, weight, opts) {
        super(apply_to, weight);
        this.building = opts.building;
    }
    evaluate(assign) {
        if (!this.appliesTo(assign))
            return 0.0;
        if (this.building == assign.building)
            return 0.0;
        return Math.pow(this.weight * 10, 10);
    }
}

class RoomConstraint extends BuildingConstraint {
    constructor(apply_to, weight, opts) {
        super(apply_to, weight, opts);
        this.room = opts.room;
    }
    evaluate(assign) {
        if (!this.appliesTo(assign))
            return 0.0;
        if (this.building == assign.building && this.room == assign.room)
            return 0.0;
        return Math.pow(this.weight * 10, 10);
    }
}

class DepartmentConstraint extends Constraint {
    evaluate(assign) {
        if (!this.appliesTo(assign))
            return 0.0;
        if (assign.class_dept == undefined)
            return 0.0;
        if (assign.class_dept.includes(assign.room_dept) || assign.room_dept.toLowerCase() == 'any')
            return 0.0;
        return Math.pow(this.weight * 10, 10);
    }
}

function docToObject(x) {
    switch (x.type) {
        case "time":
            return new TimeConstraint(x.apply_to, x.weight, x.options);
        case "building":
            return new BuildingConstraint(x.apply_to, x.weight, x.options);
        case "room":
            return new RoomConstraint(x.apply_to, x.weight, x.options);
        case "department":
            return new DepartmentConstraint(x.apply_to, x.weight, x.options);
        default:
            return zeroConstraint;
    }
}

module.exports = {
    docToObject: docToObject
}