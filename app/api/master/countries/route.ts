import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from '@/app/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const where = {
      company_id: session.user.companyId,
      ...(search && {
        name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    const [total, countries] = await Promise.all([
      prisma.ref_country.count({ where }),
      prisma.ref_country.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: countries,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const country = await prisma.ref_country.create({
      data: {
        ...data,
        company_id: session.user.companyId,
        created_by: session.user.email,
        updated_by: session.user.email,
      },
    });

    return NextResponse.json(country);
  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { company_id, name, code, ...updateData } = data;

    const country = await prisma.ref_country.update({
      where: {
        company_id_code: {
          company_id: session.user.companyId,
          code: code
        }
      },
      data: {
        ...updateData,
        updated_by: session.user.email,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(country);
  } catch (error) {
    console.error('Error updating country:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ error: 'Country code is required' }, { status: 400 });
    }

    await prisma.ref_country.delete({
      where: {
        company_id_code: {
          company_id: session.user.companyId,
          code: code
        }
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
