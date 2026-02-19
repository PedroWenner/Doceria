import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class RoutingService {
    constructor(private readonly httpService: HttpService) { }

    async getRoute(originLat: number, originLon: number, destLat: number, destLon: number) {
        const url = `http://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`;

        try {
            const response = await lastValueFrom(this.httpService.get(url));

            if (!response.data.routes || response.data.routes.length === 0) {
                throw new HttpException('No route found', HttpStatus.NOT_FOUND);
            }

            const route = response.data.routes[0];
            return {
                distance: route.distance, // meters
                duration: route.duration, // seconds
                origin: { lat: originLat, lon: originLon },
                destination: { lat: destLat, lon: destLon },
            };
        } catch (error) {
            throw new HttpException('Failed to fetch route', HttpStatus.BAD_GATEWAY);
        }
    }
}
