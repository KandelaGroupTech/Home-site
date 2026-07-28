"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerFullSyncToAirtable = exports.scheduledFullSyncToAirtable = exports.syncDocumentsToAirtable = exports.syncUsersToAirtable = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const airtable_1 = __importDefault(require("airtable"));
// Configure Airtable using environment variables. 
// These must be set using Firebase environment config or Secret Manager:
// firebase functions:config:set airtable.api_key="YOUR_KEY" airtable.base_id="YOUR_BASE_ID"
const getAirtableBase = () => {
    var _a, _b;
    // Check if configuration exists
    const apiKey = ((_a = functions.config().airtable) === null || _a === void 0 ? void 0 : _a.api_key) || process.env.AIRTABLE_API_KEY;
    const baseId = ((_b = functions.config().airtable) === null || _b === void 0 ? void 0 : _b.base_id) || process.env.AIRTABLE_BASE_ID;
    if (!apiKey || !baseId) {
        throw new Error('Airtable configuration missing. Set AIRTABLE_API_KEY and AIRTABLE_BASE_ID.');
    }
    airtable_1.default.configure({ apiKey });
    return airtable_1.default.base(baseId);
};
/**
 * Helper to update or create a record in Airtable based on the Firestore document.
 * We use `FirebaseID` as the primary identifier in Airtable.
 */
async function syncToAirtable(tableName, firebaseId, data) {
    const base = getAirtableBase();
    // Convert Firestore data into Airtable fields format
    const fields = {
        FirebaseID: firebaseId,
    };
    for (const [key, value] of Object.entries(data || {})) {
        if (value && typeof value === 'object' && !(value instanceof Date)) {
            // Instead of JSON.stringify which Airtable might reject if the column is misconfigured, 
            // format it as a clean text block
            if (Array.isArray(value)) {
                fields[key] = value.join(', ');
            }
            else {
                fields[key] = Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n');
            }
        }
        else {
            fields[key] = value;
        }
    }
    try {
        // Search for existing record by FirebaseID
        const records = await base(tableName).select({
            filterByFormula: `{FirebaseID} = '${firebaseId}'`,
            maxRecords: 1
        }).firstPage();
        if (records.length > 0) {
            // Update existing record
            await base(tableName).update([
                {
                    id: records[0].id,
                    fields: fields
                }
            ], { typecast: true });
            console.log(`Successfully updated Airtable record in ${tableName} for FirebaseID ${firebaseId}`);
        }
        else {
            // Create new record
            await base(tableName).create([
                {
                    fields: fields
                }
            ], { typecast: true });
            console.log(`Successfully created Airtable record in ${tableName} for FirebaseID ${firebaseId}`);
        }
    }
    catch (error) {
        console.error(`Error syncing to Airtable (${tableName}):`, error);
    }
}
/**
 * Triggered when a document in the 'users' collection is created, updated, or deleted.
 */
exports.syncUsersToAirtable = functions.firestore
    .document('users/{userId}')
    .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const tableName = 'Users';
    if (!change.after.exists) {
        // Document was deleted. We might want to mark it as deleted in Airtable 
        // or actually delete the record. Let's mark it or ignore if we want hard delete.
        // For now, we will just delete the record in Airtable if it exists.
        try {
            const base = getAirtableBase();
            const records = await base(tableName).select({
                filterByFormula: `{FirebaseID} = '${userId}'`,
                maxRecords: 1
            }).firstPage();
            if (records.length > 0) {
                await base(tableName).destroy([records[0].id]);
                console.log(`Deleted Airtable record for user ${userId}`);
            }
        }
        catch (error) {
            console.error(`Error deleting Airtable record for user ${userId}:`, error);
        }
        return null;
    }
    // Document was created or updated
    const data = change.after.data();
    await syncToAirtable(tableName, userId, data);
    return null;
});
/**
 * Triggered when a document in the 'documents' collection is created, updated, or deleted.
 */
exports.syncDocumentsToAirtable = functions.firestore
    .document('documents/{docId}')
    .onWrite(async (change, context) => {
    const docId = context.params.docId;
    const tableName = 'Documents';
    if (!change.after.exists) {
        try {
            const base = getAirtableBase();
            const records = await base(tableName).select({
                filterByFormula: `{FirebaseID} = '${docId}'`,
                maxRecords: 1
            }).firstPage();
            if (records.length > 0) {
                await base(tableName).destroy([records[0].id]);
                console.log(`Deleted Airtable record for document ${docId}`);
            }
        }
        catch (error) {
            console.error(`Error deleting Airtable record for document ${docId}:`, error);
        }
        return null;
    }
    const data = change.after.data();
    await syncToAirtable(tableName, docId, data);
    return null;
});
/**
 * Core full-sync logic: reads every user and document from Firestore
 * and upserts each one into Airtable.
 */
async function runFullSync() {
    const db = admin.firestore();
    let userCount = 0;
    let docCount = 0;
    let errorCount = 0;
    // Sync all users
    const usersSnapshot = await db.collection('users').get();
    for (const userDoc of usersSnapshot.docs) {
        try {
            await syncToAirtable('Users', userDoc.id, userDoc.data());
            userCount++;
        }
        catch (err) {
            console.error(`Full sync: failed on user ${userDoc.id}:`, err);
            errorCount++;
        }
    }
    // Sync all documents
    const docsSnapshot = await db.collection('documents').get();
    for (const doc of docsSnapshot.docs) {
        try {
            await syncToAirtable('Documents', doc.id, doc.data());
            docCount++;
        }
        catch (err) {
            console.error(`Full sync: failed on document ${doc.id}:`, err);
            errorCount++;
        }
    }
    console.log(`Full sync complete: ${userCount} users, ${docCount} documents synced. ${errorCount} errors.`);
    return { userCount, docCount, errorCount };
}
/**
 * Scheduled full sync — runs every day at 4:00am Eastern Time (09:00 UTC).
 */
exports.scheduledFullSyncToAirtable = functions
    .runWith({ timeoutSeconds: 540, memory: '512MB' })
    .pubsub.schedule('0 9 * * *') // 9:00 UTC = 4:00am ET (handles both EST and ~EDT)
    .timeZone('America/New_York')
    .onRun(async (_context) => {
    console.log('Running scheduled full Airtable sync...');
    await runFullSync();
    return null;
});
/**
 * HTTP endpoint to trigger an immediate full sync on demand.
 * Call it once from your browser or terminal to backfill existing records.
 * Protect this route — only call it when you need it.
 */
exports.triggerFullSyncToAirtable = functions
    .runWith({ timeoutSeconds: 540, memory: '512MB' })
    .https.onRequest(async (req, res) => {
    console.log('Manual full Airtable sync triggered via HTTP.');
    try {
        const result = await runFullSync();
        res.status(200).json(Object.assign({ success: true }, result));
    }
    catch (err) {
        console.error('Full sync failed:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});
//# sourceMappingURL=airtable.js.map