/**
 * Enhanced DollarQ Super-Quick Recognizer (JavaScript version)
 * 
 * JavaScript port of the advanced Java implementation from 
 * com.google.mlkit.samples.vision.digitalink.recognition
 * 
 * Features 11 sophisticated gesture templates with advanced geometric analysis
 */

//
// Point class - Enhanced version
//
function DollarQPoint(x, y, strokeId) {
    this.x = x;
    this.y = y;
    this.strokeId = strokeId;
    this.intX = 0; // for indexing into the LUT
    this.intY = 0; // for indexing into the LUT
}

//
// Enhanced PointCloud class
//
function DollarQPointCloud(name, points) {
    this.name = name;
    this.points = DollarQUtils.resample(points, NumPoints);
    this.points = DollarQUtils.scale(this.points);
    this.points = DollarQUtils.translateTo(this.points, Origin);
    this.points = DollarQUtils.makeIntCoords(this.points);
    this.lut = DollarQUtils.computeLUT(this.points);
    
    this.getName = function() { return this.name; };
    this.getPoints = function() { return [...this.points]; }; // Defensive copy
    this.getLUT = function() { return this.lut; };
    this.size = function() { return this.points.length; };
    this.isValid = function() { return this.points.length === NumPoints && this.lut !== null; };
    
    this.getStatistics = function() {
        return `${this.name} (${this.points.length} points, ${this.isValid() ? 'valid' : 'invalid'})`;
    };
}

// Create point cloud from coordinate array (Java style)
DollarQPointCloud.fromCoordinateArray = function(name, coordinates) {
    const points = [];
    for (let i = 0; i < coordinates.length; i += 3) {
        points.push(new DollarQPoint(coordinates[i], coordinates[i + 1], coordinates[i + 2]));
    }
    return new DollarQPointCloud(name, points);
};

//
// Enhanced Result class
//
function DollarQResult(name, score, timeMs) {
    this.name = name;
    this.score = score;
    this.timeMs = timeMs;
    
    this.getName = function() { return this.name; };
    this.getScore = function() { return this.score; };
    this.getTimeMs = function() { return this.timeMs; };
    this.isRecognized = function() { return this.score > 0 && this.name !== "No match."; };
    this.isHighConfidence = function() { return this.score > 0.7; };
    this.getConfidencePercentage = function() { return `${(this.score * 100).toFixed(1)}%`; };
    
    this.toString = function() {
        return `${this.name} (${this.getConfidencePercentage()}, ${this.timeMs}ms)`;
    };
}

// Static method for no match result
DollarQResult.noMatch = function(timeMs) {
    return new DollarQResult("No match.", 0.0, timeMs);
};

//
// Enhanced QDollarRecognizer constants
//
const NumPoints = 32;
const Origin = new DollarQPoint(0, 0, 0);
const MaxIntCoord = 1024;
const LUTSize = 64;
const LUTScaleFactor = MaxIntCoord / LUTSize;

//
// Enhanced QDollarRecognizer class with sophisticated templates
//
function EnhancedQDollarRecognizer() {
    // Initialize with 11 sophisticated gesture templates from Java implementation
    this.pointClouds = [];
    this.initializePredefinedGestures();
    
    console.log(`Enhanced DollarQ Recognizer initialized with ${this.pointClouds.length} sophisticated gestures`);
}

EnhancedQDollarRecognizer.prototype.initializePredefinedGestures = function() {
    // Gesture 1: X
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("X", [
        30,146,1, 106,222,1,
        30,225,2, 106,146,2
    ]));

    // Gesture 2: line
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("line", [
        12,347,1, 119,347,1
    ]));

    // Gesture 3: asterisk
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("asterisk", [
        325,499,1, 417,557,1,
        417,499,2, 325,557,2,
        371,486,3, 371,571,3
    ]));

    // Gesture 4: circle
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("circle", [
        382,310,1, 377,308,1, 373,307,1, 366,307,1, 360,310,1, 356,313,1, 353,316,1, 349,321,1, 347,326,1, 344,331,1, 342,337,1, 341,343,1, 341,350,1, 341,358,1, 342,362,1, 344,366,1, 347,370,1, 351,374,1, 356,379,1, 361,382,1, 368,385,1, 374,387,1, 381,387,1, 390,387,1, 397,385,1, 404,382,1, 408,378,1, 412,373,1, 416,367,1, 418,361,1, 419,353,1, 418,346,1, 417,341,1, 416,336,1, 413,331,1, 410,326,1, 404,320,1, 400,317,1, 393,313,1, 392,312,1
    ]));

    // Gesture 5: rectangle
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("rectangle", [
        188,137,1, 188,225,1,
        188,137,2, 241,137,2,
        241,137,3, 241,225,3,
        188,225,4, 241,225,4
    ]));

    // Gesture 6: horizontal-ellipse
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("horizontal-ellipse", [
        382,330,1, 375,328,1, 368,327,1, 358,327,1, 348,330,1, 340,333,1, 335,336,1, 328,341,1, 324,346,1, 319,351,1, 315,357,1, 313,363,1, 313,370,1, 313,378,1, 315,382,1, 319,386,1, 324,390,1, 331,394,1, 340,399,1, 349,402,1, 368,405,1, 384,407,1, 401,407,1, 420,407,1, 437,405,1, 454,402,1, 468,398,1, 482,393,1, 496,387,1, 508,381,1, 519,373,1, 528,366,1, 537,361,1, 546,356,1, 553,351,1, 560,346,1, 564,340,1, 568,337,1, 573,333,1, 582,312,1
    ]));

    // Gesture 7: vertical-ellipse
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("vertical-ellipse", [
        382,290,1, 379,288,1, 376,287,1, 371,287,1, 366,290,1, 362,293,1, 359,296,1, 355,301,1, 353,306,1, 350,311,1, 348,317,1, 347,323,1, 347,330,1, 347,338,1, 348,342,1, 350,346,1, 353,350,1, 357,354,1, 362,359,1, 367,362,1, 374,365,1, 380,367,1, 387,367,1, 396,367,1, 403,365,1, 410,362,1, 414,358,1, 418,353,1, 422,347,1, 424,341,1, 425,333,1, 424,326,1, 423,321,1, 422,316,1, 419,311,1, 416,306,1, 410,300,1, 406,297,1, 399,293,1, 398,292,1
    ]));

    // Gesture 8: flat-horizontal-ellipse (7:1 ratio)
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("flat-horizontal-ellipse", [
        100,347,1, 120,345,1, 140,344,1, 160,343,1, 180,342,1, 200,341,1, 220,340,1, 240,339,1, 260,338,1, 280,338,1, 300,337,1, 320,337,1, 340,337,1, 360,337,1, 380,337,1, 400,337,1, 420,337,1, 440,337,1, 460,337,1, 480,338,1, 500,338,1, 520,339,1, 540,340,1, 560,341,1, 580,342,1, 600,343,1, 620,344,1, 640,345,1, 660,347,1, 640,349,1, 620,350,1, 600,351,1, 580,352,1, 560,353,1, 540,354,1, 520,355,1, 500,356,1, 480,356,1, 460,357,1, 440,357,1, 420,357,1, 400,357,1, 380,357,1, 360,357,1, 340,357,1, 320,357,1, 300,357,1, 280,356,1, 260,356,1, 240,355,1, 220,354,1, 200,353,1, 180,352,1, 160,351,1, 140,350,1, 120,349,1
    ]));

    // Gesture 9: flat-vertical-ellipse (7:1 ratio)
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("flat-vertical-ellipse", [
        380,67,1, 378,87,1, 377,107,1, 376,127,1, 375,147,1, 374,167,1, 373,187,1, 372,207,1, 371,227,1, 371,247,1, 370,267,1, 370,287,1, 370,307,1, 370,327,1, 370,347,1, 370,367,1, 370,387,1, 370,407,1, 370,427,1, 371,447,1, 371,467,1, 372,487,1, 373,507,1, 374,527,1, 375,547,1, 376,567,1, 377,587,1, 378,607,1, 380,627,1, 382,607,1, 383,587,1, 384,567,1, 385,547,1, 386,527,1, 387,507,1, 388,487,1, 389,467,1, 389,447,1, 390,427,1, 390,407,1, 390,387,1, 390,367,1, 390,347,1, 390,327,1, 390,307,1, 390,287,1, 390,267,1, 389,247,1, 389,227,1, 388,207,1, 387,187,1, 386,167,1, 385,147,1, 384,127,1, 383,107,1, 382,87,1
    ]));

    // Gesture 10: ultra-flat-horizontal-ellipse (15:1 ratio)
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("ultra-flat-horizontal-ellipse", [
        100,347,1, 130,342,1, 160,338,1, 190,335,1, 220,333,1, 250,331,1, 280,329,1, 310,328,1, 340,327,1, 370,326,1, 400,326,1, 430,326,1, 460,326,1, 490,326,1, 520,326,1, 550,326,1, 580,326,1, 610,326,1, 640,327,1, 670,328,1, 700,329,1, 730,331,1, 760,333,1, 790,335,1, 820,338,1, 850,342,1, 880,347,1, 850,352,1, 820,356,1, 790,359,1, 760,361,1, 730,363,1, 700,365,1, 670,366,1, 640,367,1, 610,368,1, 580,368,1, 550,368,1, 520,368,1, 490,368,1, 460,368,1, 430,368,1, 400,368,1, 370,368,1, 340,367,1, 310,366,1, 280,365,1, 250,363,1, 220,361,1, 190,359,1, 160,356,1, 130,352,1
    ]));

    // Gesture 11: ultra-flat-vertical-ellipse (1:15 ratio)
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("ultra-flat-vertical-ellipse", [
        380,70,1, 374,100,1, 369,130,1, 365,160,1, 362,190,1, 360,220,1, 359,250,1, 358,280,1, 358,310,1, 358,340,1, 358,370,1, 358,400,1, 358,430,1, 358,460,1, 358,490,1, 358,520,1, 358,550,1, 358,580,1, 358,610,1, 358,640,1, 358,670,1, 358,700,1, 359,730,1, 360,760,1, 362,790,1, 365,820,1, 369,850,1, 374,880,1, 380,910,1, 386,880,1, 391,850,1, 395,820,1, 398,790,1, 400,760,1, 401,730,1, 402,700,1, 402,670,1, 402,640,1, 402,610,1, 402,580,1, 402,550,1, 402,520,1, 402,490,1, 402,460,1, 402,430,1, 402,400,1, 402,370,1, 402,340,1, 402,310,1, 401,280,1, 400,250,1, 398,220,1, 395,190,1, 391,160,1, 386,130,1, 374,100,1
    ]));

    // Gesture 12: vertical-line
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("vertical-line", [
        60,12,1, 60,119,1
    ]));

    // Gesture 13: right-slant (positive slope)
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("right-slant", [
        12,119,1, 119,12,1
    ]));

    // Gesture 14: left-slant (negative slope)
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("left-slant", [
        12,12,1, 119,119,1
    ]));

    // Gesture 15: slight-right-slant (+15° from horizontal)
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("slight-right-slant", [
        12,347,1, 115,319,1
    ]));

    // Gesture 16: slight-left-slant (-15° from horizontal)
    this.pointClouds.push(DollarQPointCloud.fromCoordinateArray("slight-left-slant", [
        12,347,1, 115,375,1
    ]));

    console.log(`Initialized ${this.pointClouds.length} sophisticated gesture templates:`);
    for (let i = 0; i < this.pointClouds.length; i++) {
        console.log(`  [${i}] ${this.pointClouds[i].getStatistics()}`);
    }
};

//
// Enhanced recognition methods
//
EnhancedQDollarRecognizer.prototype.recognize = function(points) {
    const startTime = performance.now();
    
    if (!points || points.length === 0) {
        return DollarQResult.noMatch(performance.now() - startTime);
    }
    
    const candidate = new DollarQPointCloud("", points);
    
    if (!candidate.isValid()) {
        console.warn('Invalid candidate point cloud');
        return DollarQResult.noMatch(performance.now() - startTime);
    }

    let bestMatch = -1;
    let bestDistance = Number.POSITIVE_INFINITY;

    // Compare against all templates using enhanced cloud matching
    for (let i = 0; i < this.pointClouds.length; i++) {
        const template = this.pointClouds[i];
        const distance = DollarQUtils.cloudMatch(
            candidate.getPoints(),
            template.getPoints(),
            candidate.getLUT(),
            template.getLUT(),
            bestDistance
        );
        
        if (distance < bestDistance) {
            bestDistance = distance;
            bestMatch = i;
        }
    }

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    if (bestMatch === -1) {
        return DollarQResult.noMatch(processingTime);
    }

    // Enhanced confidence calculation
    const gestureName = this.pointClouds[bestMatch].getName();
    const confidence = bestDistance > 1.0 ? (1.0 / bestDistance) : 1.0;

    console.log(`Recognition complete: '${gestureName}' (${confidence.toFixed(3)} confidence, ${processingTime.toFixed(1)}ms)`);

    return new DollarQResult(gestureName, confidence, Math.round(processingTime));
};

// Get gesture names
EnhancedQDollarRecognizer.prototype.getGestureNames = function() {
    return this.pointClouds.map(cloud => cloud.getName());
};

// Get gesture count
EnhancedQDollarRecognizer.prototype.getGestureCount = function() {
    return this.pointClouds.length;
};

// Get detailed statistics
EnhancedQDollarRecognizer.prototype.getStatistics = function() {
    let stats = `Enhanced DollarQ Recognizer: ${this.pointClouds.length} sophisticated gestures\n`;
    for (let i = 0; i < this.pointClouds.length; i++) {
        stats += `  [${i}] ${this.pointClouds[i].getStatistics()}\n`;
    }
    return stats;
};

// Add custom gesture
EnhancedQDollarRecognizer.prototype.addGesture = function(name, points) {
    const pointCloud = new DollarQPointCloud(name, points);
    this.pointClouds.push(pointCloud);
    
    // Count gestures with this name
    let count = 0;
    for (const cloud of this.pointClouds) {
        if (cloud.getName() === name) {
            count++;
        }
    }
    
    console.log(`Added gesture '${name}' (${count} variants total)`);
    return count;
};

// Delete gesture by name (removes all variants)
EnhancedQDollarRecognizer.prototype.deleteGesture = function(name) {
    const originalLength = this.pointClouds.length;
    this.pointClouds = this.pointClouds.filter(cloud => cloud.getName() !== name);
    const deletedCount = originalLength - this.pointClouds.length;
    
    console.log(`Deleted ${deletedCount} variants of gesture '${name}'`);
    return deletedCount;
};

// Delete specific gesture by index
EnhancedQDollarRecognizer.prototype.deleteGestureByIndex = function(index) {
    if (index >= 0 && index < this.pointClouds.length) {
        const removed = this.pointClouds.splice(index, 1);
        console.log(`Deleted gesture '${removed[0].getName()}' at index ${index}`);
        return removed[0].getName();
    }
    return null;
};

// Reset to default gestures
EnhancedQDollarRecognizer.prototype.resetToDefaults = function() {
    const customGestures = this.pointClouds.length - 16; // 16 is the original count
    this.pointClouds = [];
    this.initializePredefinedGestures();
    console.log(`Reset to default gestures, removed ${Math.max(0, customGestures)} custom gestures`);
    return Math.max(0, customGestures);
};

// Get gesture metadata
EnhancedQDollarRecognizer.prototype.getGestureMetadata = function() {
    return this.pointClouds.map((cloud, index) => ({
        index: index,
        name: cloud.getName(),
        isDefault: index < 16, // First 16 are default gestures
        pointCount: cloud.size(),
        isValid: cloud.isValid()
    }));
};

//
// Enhanced DollarQ Utilities (ported from Java DollarQUtils)
//
const DollarQUtils = {
    
    euclideanDistance: function(pt1, pt2) {
        const dx = pt2.x - pt1.x;
        const dy = pt2.y - pt1.y;
        return Math.sqrt(dx * dx + dy * dy);
    },

    sqrEuclideanDistance: function(pt1, pt2) {
        const dx = pt2.x - pt1.x;
        const dy = pt2.y - pt1.y;
        return dx * dx + dy * dy;
    },

    resample: function(points, n) {
        const I = DollarQUtils.pathLength(points) / (n - 1); // interval length
        let D = 0.0;
        const newpoints = [points[0]];
        
        for (let i = 1; i < points.length; i++) {
            if (points[i].strokeId === points[i-1].strokeId) {
                const d = DollarQUtils.euclideanDistance(points[i-1], points[i]);
                if ((D + d) >= I) {
                    const qx = points[i-1].x + ((I - D) / d) * (points[i].x - points[i-1].x);
                    const qy = points[i-1].y + ((I - D) / d) * (points[i].y - points[i-1].y);
                    const q = new DollarQPoint(qx, qy, points[i].strokeId);
                    newpoints.push(q);
                    points.splice(i, 0, q);
                    D = 0.0;
                } else {
                    D += d;
                }
            }
        }
        
        if (newpoints.length === n - 1) {
            const lastPoint = points[points.length - 1];
            newpoints.push(new DollarQPoint(lastPoint.x, lastPoint.y, lastPoint.strokeId));
        }
        
        return newpoints;
    },

    scale: function(points) {
        let minX = Number.POSITIVE_INFINITY, maxX = Number.NEGATIVE_INFINITY;
        let minY = Number.POSITIVE_INFINITY, maxY = Number.NEGATIVE_INFINITY;
        
        for (const point of points) {
            minX = Math.min(minX, point.x);
            minY = Math.min(minY, point.y);
            maxX = Math.max(maxX, point.x);
            maxY = Math.max(maxY, point.y);
        }
        
        const size = Math.max(maxX - minX, maxY - minY);
        const newpoints = [];
        
        for (const point of points) {
            const qx = (point.x - minX) / size;
            const qy = (point.y - minY) / size;
            newpoints.push(new DollarQPoint(qx, qy, point.strokeId));
        }
        
        return newpoints;
    },

    translateTo: function(points, pt) {
        const c = DollarQUtils.centroid(points);
        const newpoints = [];
        
        for (const point of points) {
            const qx = point.x + pt.x - c.x;
            const qy = point.y + pt.y - c.y;
            newpoints.push(new DollarQPoint(qx, qy, point.strokeId));
        }
        
        return newpoints;
    },

    centroid: function(points) {
        let x = 0.0, y = 0.0;
        for (const point of points) {
            x += point.x;
            y += point.y;
        }
        x /= points.length;
        y /= points.length;
        return new DollarQPoint(x, y, 0);
    },

    pathLength: function(points) {
        let d = 0.0;
        for (let i = 1; i < points.length; i++) {
            if (points[i].strokeId === points[i-1].strokeId) {
                d += DollarQUtils.euclideanDistance(points[i-1], points[i]);
            }
        }
        return d;
    },

    makeIntCoords: function(points) {
        for (const point of points) {
            point.intX = Math.round((point.x + 1.0) / 2.0 * (MaxIntCoord - 1));
            point.intY = Math.round((point.y + 1.0) / 2.0 * (MaxIntCoord - 1));
        }
        return points;
    },

    computeLUT: function(points) {
        const LUT = [];
        for (let i = 0; i < LUTSize; i++) {
            LUT[i] = [];
        }

        for (let x = 0; x < LUTSize; x++) {
            for (let y = 0; y < LUTSize; y++) {
                let u = -1;
                let b = Number.POSITIVE_INFINITY;
                
                for (let i = 0; i < points.length; i++) {
                    const row = Math.round(points[i].intX / LUTScaleFactor);
                    const col = Math.round(points[i].intY / LUTScaleFactor);
                    const d = ((row - x) * (row - x)) + ((col - y) * (col - y));
                    
                    if (d < b) {
                        b = d;
                        u = i;
                    }
                }
                
                LUT[x][y] = u;
            }
        }
        
        return LUT;
    },

    cloudMatch: function(candidate, template, candidateLUT, templateLUT, minSoFar) {
        const n = candidate.length;
        const step = Math.floor(Math.pow(n, 0.5));

        const LB1 = DollarQUtils.computeLowerBound(candidate, template, step, templateLUT);
        const LB2 = DollarQUtils.computeLowerBound(template, candidate, step, candidateLUT);

        for (let i = 0, j = 0; i < n; i += step, j++) {
            if (LB1[j] < minSoFar) {
                minSoFar = Math.min(minSoFar, DollarQUtils.cloudDistance(candidate, template, i, minSoFar));
            }
            if (LB2[j] < minSoFar) {
                minSoFar = Math.min(minSoFar, DollarQUtils.cloudDistance(template, candidate, i, minSoFar));
            }
        }
        
        return minSoFar;
    },

    cloudDistance: function(pts1, pts2, start, minSoFar) {
        const n = pts1.length;
        const unmatched = [];
        for (let j = 0; j < n; j++) {
            unmatched[j] = j;
        }
        
        let i = start;
        let weight = n;
        let sum = 0.0;
        
        do {
            let u = -1;
            let b = Number.POSITIVE_INFINITY;
            
            for (let j = 0; j < unmatched.length; j++) {
                const d = DollarQUtils.sqrEuclideanDistance(pts1[i], pts2[unmatched[j]]);
                if (d < b) {
                    b = d;
                    u = j;
                }
            }
            
            unmatched.splice(u, 1);
            sum += weight * b;
            
            if (sum >= minSoFar) {
                return sum; // early abandoning
            }
            
            weight--;
            i = (i + 1) % n;
        } while (i !== start);
        
        return sum;
    },

    computeLowerBound: function(pts1, pts2, step, LUT) {
        const n = pts1.length;
        const LB = new Array(Math.floor(n / step) + 1);
        const SAT = new Array(n);
        LB[0] = 0.0;
        
        for (let i = 0; i < n; i++) {
            const x = Math.round(pts1[i].intX / LUTScaleFactor);
            const y = Math.round(pts1[i].intY / LUTScaleFactor);
            const index = LUT[x][y];
            const d = DollarQUtils.sqrEuclideanDistance(pts1[i], pts2[index]);
            SAT[i] = (i === 0) ? d : SAT[i - 1] + d;
            LB[0] += (n - i) * d;
        }
        
        for (let i = step, j = 1; i < n; i += step, j++) {
            LB[j] = LB[0] + i * SAT[n-1] - n * SAT[i-1];
        }
        
        return LB;
    }
};

// Backward compatibility - maintain the same interface as the original
function QDollarRecognizer() {
    return new EnhancedQDollarRecognizer();
}

// Convert canvas points to DollarQ points
function Point(x, y, id) {
    return new DollarQPoint(x, y, id);
}

// Result interface compatibility
function Result(name, score, ms) {
    return new DollarQResult(name, score, ms);
}

console.log('Enhanced DollarQ Recognizer loaded with 11 sophisticated gesture templates');
