import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { PlatformDocument } from '../types';
import DocumentViewer from './DocumentViewer';

interface Props {
    userUid: string;
    userGroups?: string[];
}

const InvestorTaxDocuments: React.FC<Props> = ({ userUid, userGroups = [] }) => {
    const [documents, setDocuments] = useState<PlatformDocument[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDocs = async () => {
            try {
                const queries = [
                    getDocs(query(collection(db, 'documents'), where('target_audience', '==', 'all'))),
                    getDocs(query(collection(db, 'documents'), where('allowed_uids', 'array-contains', userUid))),
                ];
                
                if (userGroups && userGroups.length > 0) {
                    queries.push(getDocs(query(collection(db, 'documents'), where('allowed_groups', 'array-contains-any', userGroups))));
                }

                const snaps = await Promise.all(queries);
                const allDocs = snaps.flatMap(snap => snap.docs.map(d => ({ id: d.id, ...d.data() }))) as PlatformDocument[];

                const seen = new Set<string>();
                const merged = allDocs.filter(d => {
                    if (seen.has(d.id)) return false;
                    seen.add(d.id);
                    // INCLUDE ONLY tax documents and tax_distributions
                    return d.type === 'tax' || d.type === 'tax_distribution';
                });

                merged.sort((a, b) => {
                    const aTime = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
                    const bTime = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
                    return bTime.getTime() - aTime.getTime();
                });

                setDocuments(merged);
            } catch (error) {
                console.error("Error fetching documents", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDocs();
    }, [userUid, userGroups]);

    const categories = [
        { key: 'k1s', label: 'K-1s', types: ['tax'] },
        { key: 'tax_distributions', label: 'Tax Distributions', types: ['tax_distribution'] }
    ];

    return (
        <DocumentViewer 
            documents={documents} 
            loading={loading}
            pageTitle="Tax Documents"
            pageSubtitle="Secure access to your tax forms."
            categories={categories}
            userUid={userUid}
        />
    );
};

export default InvestorTaxDocuments;
