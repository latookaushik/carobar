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

    const [total, makers] = await Promise.all([
      prisma.ref_maker.count({ where }),
      prisma.ref_maker.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: makers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching makers:', error);
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
    const maker = await prisma.ref_maker.create({
      data: {
        ...data,
        company_id: session.user.companyId,
        created_by: session.user.email,
        updated_by: session.user.email,
      },
    });

    return NextResponse.json(maker);
  } catch (error) {
    console.error('Error creating maker:', error);
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
    const { ...updateData } = data;

    const maker = await prisma.ref_maker.update({
      where: {
        company_id_name: {
          company_id: session.user.companyId,
          name: data.name,
        },
      },
      data: {
        ...updateData,
        updated_by: session.user.email,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(maker);
  } catch (error) {
    console.error('Error updating maker:', error);
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
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Maker name is required' }, { status: 400 });
    }

    await prisma.ref_maker.delete({
      where: {
        company_id_name: {
          company_id: session.user.companyId,
          name: name,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting maker:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
