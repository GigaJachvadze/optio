import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { Users } from './users/users';
import { Segments } from './segments/segments';
import { CreateSegment } from './segments/create-segment/create-segment';
import { EditSegment } from './segments/edit-segment/edit-segment';
import { SegmentDetails } from './segments/segment-details/segment-details';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        component: Dashboard
    },
    {
        path: 'users',
        component: Users
    },
    {
        path: 'segments',
        children: [
            {
                path: '',
                component: Segments,
            },
            {
                path: 'details/:id',
                component: SegmentDetails,
            },
            {
                path: 'create',
                component: CreateSegment
            },
            {
                path: 'edit/:id',
                component: EditSegment
            }
        ]
    },
    {
        path: '**',
        redirectTo: 'dashboard'
    },
];
