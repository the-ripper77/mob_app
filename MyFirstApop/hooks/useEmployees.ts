import { useEffect, useState } from 'react';

import type { Employee } from '@/data/types';
import {
    createEmployee as dbCreateEmployee,
    subscribeEmployees,
    updateEmployee as dbUpdateEmployee,
} from '@/lib/database';

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = subscribeEmployees((list) => {
            setEmployees(list);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    async function addEmployee(emp: Omit<Employee, 'id' | 'createdAt'>) {
        return dbCreateEmployee(emp);
    }

    async function updateEmployee(id: string, data: Partial<Employee>) {
        await dbUpdateEmployee(id, data);
    }

    return { employees, loading, addEmployee, updateEmployee };
}
