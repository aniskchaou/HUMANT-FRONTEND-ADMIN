package com.dev.delta.entities;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;


@Entity
public class Notice {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	Long id;
	String NoticeTitle;
	String StartDate;
	String EndDate;
	String NoticeNote;
	
	public Notice() {
		// TODO Auto-generated constructor stub
	}

	public Notice(String noticeTitle, String startDate, String endDate, String noticeNote) {
		super();
		NoticeTitle = noticeTitle;
		StartDate = startDate;
		EndDate = endDate;
		NoticeNote = noticeNote;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNoticeTitle() {
		return NoticeTitle;
	}

	public void setNoticeTitle(String noticeTitle) {
		NoticeTitle = noticeTitle;
	}

	public String getStartDate() {
		return StartDate;
	}

	public void setStartDate(String startDate) {
		StartDate = startDate;
	}

	public String getEndDate() {
		return EndDate;
	}

	public void setEndDate(String endDate) {
		EndDate = endDate;
	}

	public String getNoticeNote() {
		return NoticeNote;
	}

	public void setNoticeNote(String noticeNote) {
		NoticeNote = noticeNote;
	}
	
	
}
