package com.dev.delta.services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.dev.delta.entities.Notice;
import com.dev.delta.repositories.NoticeRepository;
@Service
public class NoticeService {
	/**
	 * noticeRepository
	 */
	@Autowired
	private NoticeRepository noticeRepository;

	/**
	 * getNotices
	 * 
	 * @return
	 */
	public List<Notice> getNotices() {
		return noticeRepository.findAll();
	}

	/**
	 * getCount
	 * 
	 * @return
	 */
	public long getCount() {
		return noticeRepository.count();
	}

	/**
	 * save
	 * 
	 * @param notice
	 */
	public Notice save(Notice notice) {
		return noticeRepository.save(notice);
	}

	/**
	 * findById
	 * 
	 * @param id
	 * @return
	 */
	public Notice findById(Long id) {
		return noticeRepository.findById(id).orElseThrow();
	}

	public Notice update(Long id, Notice noticeDetails) {
		Notice notice = findById(id);
		notice.setNoticeTitle(noticeDetails.getNoticeTitle());
		notice.setStartDate(noticeDetails.getStartDate());
		notice.setEndDate(noticeDetails.getEndDate());
		notice.setNoticeNote(noticeDetails.getNoticeNote());
		return noticeRepository.save(notice);
	}

	/**
	 * delete
	 * 
	 * @param id
	 */
	public void delete(Long id) {
		noticeRepository.delete(noticeRepository.findById(id).get());
	}
}
