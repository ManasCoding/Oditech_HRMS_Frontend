
export function getEmployeeAttendanceStatus(attendance) {
  if (!attendance || !attendance.checkIn) {
    return 'Absent';
  }

  if (attendance.checkInApprovalStatus === 'Pending') {
    return 'Absent';
  }

  if (attendance.checkInApprovalStatus === 'Approved') {
    return attendance.status;
  }

  if (attendance.checkInApprovalStatus === 'Rejected') {
    return 'Absent';
  }

  return attendance.status || 'Absent';
}
