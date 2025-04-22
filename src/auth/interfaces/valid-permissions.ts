export interface RequiredPermission {
    module: 'Authentication' | 'Images' | 'Permission' | 'Puck';
    permission: 'canRead' | 'canCreate' | 'canUpdate' | 'canDelete';
}
