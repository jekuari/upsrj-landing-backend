export interface RequiredPermission {
    module: 'Authentication' | 'Images' | 'Permission' | 'Puck' | 'Videos' | 'Files' | 'Blog' | 'Templates' | 'Navbar';
    permission: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete';
}
