
import * as fs from 'fs';
import * as d3Contour from 'd3-contour'

let w = 556;
let h = 384;
let xllcorner=114.18562400068;
let yllcorner=22.67010711186;
let cellsize=0.00027777778;

let pixelToLngLat=function(pixel){
    let lng= xllcorner+pixel[0]*cellsize;
    let lat= yllcorner+(h-pixel[1])*cellsize;
    return [lng,lat];
}

fs.readFile('data/values24.json', function (err, data) {
    if (err) {
        console.log(err);
    } else {
        // console.log(data.toString());
        let jsonstr = data.toString();
        let values = JSON.parse(jsonstr).data;

        let polygons = d3Contour.contours()
            .size([w, h])
            .smooth(true)
            .thresholds([0.1, 0.2,0.3,0.5,0.6,0.8,1])
            (values);
        console.log(polygons);

        let resultgeojson = {
            type: 'FeatureCollection',
            features: []
        };

        polygons.forEach((polygon) => {

            //像素转经纬度
            let coordinates=polygon.coordinates;
            let tCoordinates=[];
            for(var i=0;i<coordinates.length;i++){
                let poly=coordinates[i];
                let tPoly=[];
                for(var j=0;j<poly.length;j++){
                    let linestring=poly[j];
                    let tLinestring=[];
                    for(var k=0;k<linestring.length;k++){
                        let coord=linestring[k];
                        let tCoord = pixelToLngLat(coord);
                        tLinestring.push(tCoord);
                    }
                    tPoly.push(tLinestring);
                }
                tCoordinates.push(tPoly);
            }

            resultgeojson.features.push({
                type: 'Feature',
                properties: {
                    value: polygon.value,
                    idx: 0
                },
                geometry: {
                    type: 'MultiPolygon',
                    coordinates: tCoordinates
                }
            });
        });

        fs.writeFile('data/contours_test2.geojson', JSON.stringify(resultgeojson), function (error) {
            if (error) {
                console.log("写入文件失败")
                return
            } else {
                console.log("写入文件成功")
            }

        })

    }
});
