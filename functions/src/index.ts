import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

export const deleteInvestor = functions.https.onCall(async (data, context) => {
    // 1. Verify caller is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'You must be logged in to call this function.'
        );
    }

    const targetUid = data.uid;
    if (!targetUid || typeof targetUid !== 'string') {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'The function must be called with one argument "uid" containing the user UID to delete.'
        );
    }

    // 2. Verify caller is an admin
    const callerDoc = await db.collection('users').doc(context.auth.uid).get();
    if (!callerDoc.exists || callerDoc.data()?.role !== 'admin') {
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only administrators can delete users.'
        );
    }

    try {
        // 3. Delete from Firebase Auth
        await admin.auth().deleteUser(targetUid);
        
        // 4. Delete from Firestore
        await db.collection('users').doc(targetUid).delete();

        return { success: true, message: `Successfully deleted user ${targetUid}.` };
    } catch (error: any) {
        console.error('Error deleting user:', error);
        throw new functions.https.HttpsError(
            'internal',
            'An error occurred while deleting the user: ' + error.message
        );
    }
});
