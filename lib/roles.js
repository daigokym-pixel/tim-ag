// 権限は3種類
// - オーナー：すべての操作（承認・停止・権限の変更）
// - 担当者（staff）：メンバーの進み具合と回答の閲覧、関門の許可、承認
// - メンバー：自分の研修だけ
export const isApproved = (m) => !!m && m.status === 'approved';
export const isOwner = (m) => isApproved(m) && m.role === 'owner';
export const isStaff = (m) => isApproved(m) && (m.role === 'staff' || m.role === 'owner');
