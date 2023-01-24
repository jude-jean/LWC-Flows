public with sharing class UserService {
    public UserService() {

    }

    public static Set<Id> getRoleSubordinateUsers(Id roleId, Boolean isActive) {

        Map<Id,User> users;
        // get all of the roles underneath the user
        Set<Id> allSubRoleIds = getAllSubRoleIds(new Set<ID>{roleId});
        // get all of the ids for the users in those roles
        if(isActive) {
            users = new Map<Id, User>([Select Id, Name From User where UserRoleId IN :allSubRoleIds And isActive = true]);
        }
        else {
            users = new Map<Id, User>([Select Id, Name From User where UserRoleId IN :allSubRoleIds]);
        }
        // return the ids as a set so you can do what you want with them
        return users.keySet();
    }

    public static Set<Id> getRoleSubordinateUsers(Id roleId) {
        return getRoleSubordinateUsers(roleId, false);
    }

    private static Set<Id> getAllSubRoleIds(Set<Id> roleIds) {

        Set<Id> currentRoleIds = new Set<Id>();
        // get all of the roles underneath the passed roles
        for(UserRole userRole :[select Id from UserRole where ParentRoleId IN :roleIds AND ParentRoleID != null]) {
            currentRoleIds.add(userRole.Id);
        }

        // go fetch some more rolls!
        if(currentRoleIds.size() > 0) {
            currentRoleIds.addAll(getAllSubRoleIds(currentRoleIds));
        }
        return currentRoleIds;
    }
        
}