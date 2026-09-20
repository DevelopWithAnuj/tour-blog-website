// Booking model placeholder
export class Booking {
  constructor({ id, tourId, userId, date, status }) {
    this.id = id;
    this.tourId = tourId;
    this.userId = userId;
    this.date = date;
    this.status = status || 'pending';
  }
}
