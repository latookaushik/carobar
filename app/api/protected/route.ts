// app/api/protected/route.ts

// protected/route.ts  in conjunction with authMiddleware.ts, sets up a secure API endpoint 
//  in the  application. 
// It ensures that only authenticated users 
//  (and optionally, those with specific roles) can access the data 
//  or functionality provided by that endpoint. 

//  The main function, protectedHandler, is an example of what the api should do 
// once the authentification step is completed.

import { withAuth } from '@/app/lib/authMiddleware';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@/app/lib/enums'; // Import the Role enum

async function protectedHandler(req: NextRequest): Promise<NextResponse> {
  return NextResponse.json(
    {
      message: 'This is a protected page',
      user: (req).user,
    },
    { status: 200 },
  );
}

// requiredRoles : only Super admin , Company Admin and Standard user can acces it
export const GET = withAuth(async (req: NextRequest) => {
  return protectedHandler(req);
}, [Role.ADMIN, Role.MANAGER, Role.STAFF]); 
