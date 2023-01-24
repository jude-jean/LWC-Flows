public with sharing class CaseService {
    public CaseService() {

    }

    /**
     * 27/10/2022 - JJE - SPARC-2938 : Mass Change Owner
     *
     * @param currentOwnerId
     * @param newOwnerId
     * @param newOwnerType
     * @param newOwnerName
     * @param caseIds
     */
    //@future
    public static void updateCaseOwner(Id currentOwnerId, Id newOwnerId, String newOwnerType, String newOwnerName, Set<Id> caseIds) {
        System.debug('CaseController.updateCaseOwner - PARAMS : currentOwnerId=' + currentOwnerId + ', newOwnerId=' + newOwnerId + ', newOwnerType=' + newOwnerType + ', newOwnerName=' + newOwnerName + ', caseIds=' + caseIds);

        // GET CASES
        List<Case> cases = [Select Id, CaseNumber, OwnerId From Case Where Id in :caseIds];
        System.debug('CaseController.updateCaseOwner - PROCESSING : cases.size()=' + cases.size());
        if (CollectionUtils.isNotEmpty(cases)) {

            // UPDATE CASES
            for (Case c :cases) {
                c.OwnerId = newOwnerId;
            }
            Map<Id, Case> mapIdVsCase = new Map<Id, Case>(cases);
            System.debug('Liste des cases a updated = '+cases);
            Database.SaveResult[] srList = Database.update(cases, false);
            Messaging.CustomNotification notify = new Messaging.CustomNotification();
            notify.setTitle('Case owner change');
            //notify.setBody('Case owner change success');
            CustomNotificationType ct = [Select Id From CustomNotificationType Where developerName = 'CaseOwnerChange'];
            notify.setNotificationTypeId(ct.Id);

            // SEND NOTIFICATIONS
            List<Id> lstUser = new List<Id>();
            Set<String> setNewOwnerId = new Set<String>();
            Set<String> setCurrentOwnerId = new Set<String>{currentOwnerId};
            if(newOwnerType == 'queue') {
                // Recherche des membres de la queue
                lstUser = searchUsersInQueue(newOwnerId);
                for(Id memberId :lstUser) {
                    setNewOwnerId.add(String.valueOf(memberId));
                }
            }
            else {
                setNewOwnerId = new Set<String>{newOwnerId};
            }
            for(Database.SaveResult sr :srList) {
                if(sr.isSuccess()) {
                    //lstCaseId.add(sr.getId());
                    // Notify Previous Owner
                    notify.setTargetId(sr.getId());
                    notify.setBody('Case "'+mapIdVsCase.get(sr.getId()).CaseNumber+'" : owner changed to "' + newOwnerName + '".');
                    notify.send(setCurrentOwnerId);
                    // Notify New Owner
                    if (setNewOwnerId != null && !setNewOwnerId.isEmpty()) {
                        if(lstUser != null && lstUser.size() > 0) {
                            notify.setBody('As member of queue '+newOwnerName+', new owner to case '+mapIdVsCase.get(sr.getId()).CaseNumber+', you receive this notification.');
                        }
                        else {
                            notify.setBody('You receive this notification because you are the new owner of the case '+mapIdVsCase.get(sr.getId()).CaseNumber);
                        }
                        notify.send(setNewOwnerId);
                    }
                }
            }
        }
    }

    /**
     * 27/10/2022 - JJE - SPARC-2938 : Mass Change Owner
     *
     * @param queueId
     * @return
     */
    public static List<Id> searchUsersInQueue(Id queueId) {
        List<Id> lstUser = new List<Id>();
        List<Id> lstUserIdToValidate = new List<Id>();
        List<User> lstUserValidated = new List<User>();
        // D'abord, on recherche le type du groupe
        Group grp = [Select Id, Type, RelatedId From Group Where Id = :queueId];
        if(grp.Type == 'Queue') {
            List<GroupMember> lstMember = [Select UserOrGroupId From GroupMember Where GroupId =:queueId];
            for(GroupMember member :lstMember) {
                if(member.UserOrGroupId.getSobjectType() == Schema.User.SObjectType) {
                    lstUserIdToValidate.add(member.UserOrGroupId);
                }
                else {
                    lstUser.addAll(searchUsersInQueue(member.UserOrGroupId));
                }
            }
            if(lstUserIdToValidate != null && lstUserIdToValidate.size() > 0) {
                lstUserValidated = [Select Id From User where Id IN :lstUserIdToValidate And isActive = true];
                if(lstUserValidated != null && lstUserValidated.size() > 0) {
                    for(User u :lstUserValidated) {
                        lstUser.add(u.Id);
                    }
                }
            }
        }
        else if(grp.Type == 'Role') {
            lstUser.addAll(UserService.getRoleSubordinateUsers(grp.RelatedId, true));
        }

        return lstUser;
    }

}