public with sharing class CaseController {
    /**
     * 27/10/2022 - JJE - SPARC-2938 : Mass Change Owner
     *
     * @param currentOwnerId
     * @param newOwnerId
     * @param newOwnerType
     * @param newOwnerName
     * @param caseIds
     * @return
     */
    @AuraEnabled()
    public static boolean changeCaseOwner(Id currentOwnerId, Id newOwnerId, String newOwnerType, String newOwnerName, List<Id> caseIds){
        try {
            if (CollectionUtils.isNotEmpty(caseIds)) {
                CaseService.updateCaseOwner(currentOwnerId, newOwnerId, newOwnerType, newOwnerName, new Set<Id>(caseIds));
                return true;
            }
            else {
                return false;
            }
        }
        catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    /**
     * Exception
     */
    //public class CaseControllerException extends Exception {}

}