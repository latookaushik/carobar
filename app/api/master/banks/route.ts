import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/app/lib/prisma';
import { getServerSession } from '@/app/lib/auth';
import { Role } from '@/app/lib/enums';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (
      session.user.roleId !== Role.ADMIN &&
      session.user.roleId !== Role.MANAGER &&
      session.user.roleId !== Role.STAFF
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'bank_name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    const where = {
      company_id: session.user.companyId,
      ...(search && {
        bank_name: {
          contains: search,
          mode: 'insensitive' as const,
        },
      }),
    };

    const [total, banks] = await Promise.all([
      prisma.ref_bank.count({ where }),
      prisma.ref_bank.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      data: banks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching banks:', error);
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
    const bank = await prisma.ref_bank.create({
      data: {
        ...data,
        company_id: session.user.companyId,
        created_by: session.user.userId,
        updated_by: session.user.userId,
      },
    });

    return NextResponse.json(bank);
  } catch (error) {
    console.error('Error creating bank:', error);
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
    const { company_id, account_number, ...updateData } = data;

    const bank = await prisma.ref_bank.update({
      where: {
        company_id_account_number: {
          company_id: session.user.companyId,
          account_number: account_number,
        },
      },
      data: {
        ...updateData,
        updated_by: session.user.userId,
        updated_at: new Date(),
      },
    });

    return NextResponse.json(bank);
  } catch (error) {
    console.error('Error updating bank:', error);
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
    const account_number = searchParams.get('account_number');

    if (!account_number) {
      return NextResponse.json({ error: 'Account number is required' }, { status: 400 });
    }

    await prisma.ref_bank.delete({
      where: {
        company_id_account_number: {
          company_id: session.user.companyId,
          account_number: account_number,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting bank:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
