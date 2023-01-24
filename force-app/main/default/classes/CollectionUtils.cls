public with sharing class CollectionUtils {
    /**
     * [isEmpty description]
     * @param  l [description]
     * @return   [description]
     */
    public static Boolean isEmpty(List<Object> l) {
        Boolean isEmpty = false;
        if (l == null || l.isEmpty()) {
            isEmpty = true;
        }
        return isEmpty;
    }

    /**
     * [isNotEmpty description]
     * @param  l [description]
     * @return   [description]
     */
    public static Boolean isNotEmpty(List<Object> l) {
        return !isEmpty(l);
    }

}