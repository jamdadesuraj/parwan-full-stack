import { Document } from "mongoose";

export interface IContact extends Document {
  fullName: string;
  emailAddress: string;
  phone: string;
  companyName?: string; // optional in the form
  productOfInterest: string;
  requiredQty: string; // string, so "50 kg" or "2 cartons" works
  message: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
} 
