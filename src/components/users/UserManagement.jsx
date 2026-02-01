import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, X, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import usersData from '../../data/usersData.json';
import {
    createUser,
    deleteUser,
    getUsers,
    updateUser,
    updateUserPassword
} from './usersService';
import { getRoles } from './rolesService';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState(usersData);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editedUser, setEditedUser] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState({});
    const [newUser, setNewUser] = useState({
        userName: '',
        email: '',
        enterpriseId: 1,
        password: '',
        roleName: ''
    });
    const [newPassword, setNewPassword] = useState('');
    const [roles, setRoles] = useState([]);

    const normalizeUser = (item) => {
        const roles = Array.isArray(item.roles) ? item.roles : [];
        const roleNames = roles.map((role) => role.role_name).filter(Boolean);
        return {
            id: item.id ?? item.user_id ?? item.uid ?? item.cid ?? item.userId,
            userName: item.user_name ?? item.name ?? item.userName ?? '',
            email: item.email ?? '',
            enterpriseId: item.enterprise_id ?? item.enterpriseId ?? '',
            roleName: roleNames.length > 0 ? roleNames.join(', ') : '',
            createdAt: item.created_at ?? item.createdAt ?? ''
        };
    };

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            setLoadError(null);

            try {
                const data = await getUsers({ skip: 0, limit: 100, includeRoles: true });
                const rawUsers = data?.data?.users || data?.users || [];
                setUsers(rawUsers.map(normalizeUser));
            } catch (error) {
                console.error('Failed to load users:', error);
                setLoadError('Failed to load latest users. Showing cached data.');
                setUsers(usersData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const data = await getRoles({ skip: 0, limit: 100 });
                const rawRoles = data?.data?.roles || data?.data || data?.roles || data || [];
                setRoles(rawRoles);
            } catch (error) {
                console.error('Failed to load roles:', error);
                setRoles([]);
            }
        };

        fetchRoles();
    }, []);

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditedUser({ ...user });
        setNewPassword('');
    };

    const handleDelete = async (userId) => {
        if (!window.confirm('Delete this user?')) return;
        try {
            setActionLoading((prev) => ({ ...prev, [userId]: 'delete' }));
            await deleteUser(userId);
            setUsers((prev) => prev.filter((user) => user.id !== userId));
            toast.success('User deleted');
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error('Failed to delete user');
        } finally {
            setActionLoading((prev) => ({ ...prev, [userId]: null }));
        }
    };

    const handleSave = async () => {
        try {
            setActionLoading((prev) => ({ ...prev, update: 'update' }));
            await updateUser(editedUser.id, {
                user_name: editedUser.userName,
                email: editedUser.email,
                enterprise_id: Number(editedUser.enterpriseId) || 1,
                role_name: editedUser.roleName || undefined
            });

            if (newPassword) {
                await updateUserPassword(editedUser.id, { password: newPassword });
            }

            setUsers((prev) =>
                prev.map((user) => (user.id === editedUser.id ? editedUser : user))
            );
            toast.success('User updated');
            setSelectedUser(null);
            setEditedUser(null);
            setNewPassword('');
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update user');
        } finally {
            setActionLoading((prev) => ({ ...prev, update: null }));
        }
    };

    const handleCreate = async () => {
        try {
            setActionLoading((prev) => ({ ...prev, create: 'create' }));
            await createUser({
                user_name: newUser.userName,
                email: newUser.email,
                enterprise_id: Number(newUser.enterpriseId) || 1,
                password: newUser.password,
                role_name: newUser.roleName || undefined
            });
            toast.success('User created');
            setIsCreateOpen(false);
            setNewUser({ userName: '', email: '', enterpriseId: 1, password: '', roleName: '' });
            const data = await getUsers({ skip: 0, limit: 100, includeRoles: true });
            const rawUsers = data?.data?.users || data?.users || [];
            setUsers(rawUsers.map(normalizeUser));
        } catch (error) {
            console.error('Failed to create user:', error);
            toast.error('Failed to create user');
        } finally {
            setActionLoading((prev) => ({ ...prev, create: null }));
        }
    };

    return (
        <div className="user-management-container">
            <div className="user-management-header">
                <h2 className="user-management-title">User Management</h2>
                {loadError && <div className="user-management-error">{loadError}</div>}
                {!loadError && isLoading && <div className="user-management-loading">Loading...</div>}
                <button
                    type="button"
                    className="user-create-btn"
                    onClick={() => setIsCreateOpen(true)}
                >
                    <UserPlus size={16} />
                    Create User
                </button>
            </div>

            <div className="user-table-card">
                <table className="user-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Enterprise ID</th>
                            <th>Role</th>
                            <th>Created</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td>{user.userName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.enterpriseId || '-'}</td>
                                    <td>{user.roleName || '-'}</td>
                                    <td>{user.createdAt || '-'}</td>
                                    <td>
                                        <div className="user-actions">
                                            <button
                                                className="user-action-btn"
                                                onClick={() => handleEdit(user)}
                                                disabled={actionLoading[user.id] === 'delete'}
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                className="user-action-btn danger"
                                                onClick={() => handleDelete(user.id)}
                                                disabled={actionLoading[user.id] === 'delete'}
                                            >
                                                {actionLoading[user.id] === 'delete' ? (
                                                    <span className="btn-spinner" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="user-empty">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isCreateOpen && (
                <div className="user-modal-overlay" onClick={() => setIsCreateOpen(false)}>
                    <div className="user-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="user-modal-header">
                            <h3>Create User</h3>
                            <button
                                type="button"
                                className="user-modal-close"
                                onClick={() => setIsCreateOpen(false)}
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="user-modal-grid">
                            <label>
                                Name
                                <input
                                    type="text"
                                    value={newUser.userName}
                                    onChange={(e) => setNewUser({ ...newUser, userName: e.target.value })}
                                />
                            </label>
                            <label>
                                Email
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </label>
                            <label>
                                Enterprise ID
                                <input
                                    type="number"
                                    value={newUser.enterpriseId}
                                    onChange={(e) => setNewUser({ ...newUser, enterpriseId: e.target.value })}
                                />
                            </label>
                            <label>
                                Role
                                <select
                                    value={newUser.roleName}
                                    onChange={(e) => setNewUser({ ...newUser, roleName: e.target.value })}
                                >
                                    <option value="">Select role</option>
                                    {roles.map((role) => (
                                        <option key={role.role_name || role.name} value={role.role_name || role.name}>
                                            {role.role_name || role.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Password
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </label>
                        </div>
                        <div className="user-modal-footer">
                            <button
                                type="button"
                                className="user-btn ghost"
                                onClick={() => setIsCreateOpen(false)}
                                disabled={actionLoading.create === 'create'}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="user-btn primary"
                                onClick={handleCreate}
                                disabled={actionLoading.create === 'create'}
                            >
                                {actionLoading.create === 'create' ? 'Creating...' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedUser && editedUser && (
                <div className="user-modal-overlay" onClick={() => setSelectedUser(null)}>
                    <div className="user-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="user-modal-header">
                            <h3>Edit User</h3>
                            <button
                                type="button"
                                className="user-modal-close"
                                onClick={() => setSelectedUser(null)}
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="user-modal-grid">
                            <label>
                                Name
                                <input
                                    type="text"
                                    value={editedUser.userName}
                                    onChange={(e) => setEditedUser({ ...editedUser, userName: e.target.value })}
                                />
                            </label>
                            <label>
                                Email
                                <input
                                    type="email"
                                    value={editedUser.email}
                                    onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                                />
                            </label>
                            <label>
                                Enterprise ID
                                <input
                                    type="number"
                                    value={editedUser.enterpriseId}
                                    onChange={(e) => setEditedUser({ ...editedUser, enterpriseId: e.target.value })}
                                />
                            </label>
                            <label>
                                Role
                                <select
                                    value={editedUser.roleName || ''}
                                    onChange={(e) => setEditedUser({ ...editedUser, roleName: e.target.value })}
                                >
                                    <option value="">Select role</option>
                                    {roles.map((role) => (
                                        <option key={role.role_name || role.name} value={role.role_name || role.name}>
                                            {role.role_name || role.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                New Password (optional)
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="user-modal-footer">
                            <button
                                type="button"
                                className="user-btn ghost"
                                onClick={() => setSelectedUser(null)}
                                disabled={actionLoading.update === 'update'}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="user-btn primary"
                                onClick={handleSave}
                                disabled={actionLoading.update === 'update'}
                            >
                                {actionLoading.update === 'update' ? 'Updating...' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;

