import xlrd
import csv
from sortedcontainers import SortedDict
#----------------------------------------------------------------------
def open_file(path):

  book = xlrd.open_workbook(path)
  sheet = book.sheet_by_index(0)

  major_name = []
  numStudByMajor1y = []
  numStudByMajor2y = []
  for row_index in xrange(1, sheet.nrows):
    row = sheet.row_values(row_index)
    if row[4] not in major_name:
      major_name.append(row[4])
    if len(major_name) is 18:
      break

  flow = dict([(major,{}) for major in major_name])
  numStudByMajor1y = dict([(major,{}) for major in major_name])
  numStudByMajor2y = dict([(major,{}) for major in major_name])

  for key in flow:
    flow[key] = dict([(major,{}) for major in major_name])
    numStudByMajor1y[key]["Total"] = 0;
    numStudByMajor1y[key]["Male"] = 0;
    numStudByMajor1y[key]["Female"] = 0;
    numStudByMajor1y[key]["Good"] = 0;
    numStudByMajor1y[key]["Moderate"] = 0;
    numStudByMajor1y[key]["Poor"] = 0;

    numStudByMajor2y[key]["Total"] = 0;
    numStudByMajor2y[key]["Male"] = 0;
    numStudByMajor2y[key]["Female"] = 0;
    numStudByMajor2y[key]["Good"] = 0;
    numStudByMajor2y[key]["Moderate"] = 0;
    numStudByMajor2y[key]["Poor"] = 0;

    for key1 in flow[key]:
      flow[key][key1]["_1Total"] = 0
      flow[key][key1]["_1Male"] = 0
      flow[key][key1]["_1Female"] = 0
      flow[key][key1]["_1Good"] = 0
      flow[key][key1]["_1Moderate"] = 0
      flow[key][key1]["_1Poor"] = 0

      flow[key][key1]["_2Total"] = 0
      flow[key][key1]["_2Male"] = 0
      flow[key][key1]["_2Female"] = 0
      flow[key][key1]["_2Good"] = 0
      flow[key][key1]["_2Moderate"] = 0
      flow[key][key1]["_2Poor"] = 0

  for key in flow:
    print flow[key]

  for row_index in xrange(1, sheet.nrows):
    row = sheet.row_values(row_index)
    numStudByMajor1y[row[2]]["Total"] += row[12];
    numStudByMajor1y[row[2]][row[0]] += row[12];
    numStudByMajor1y[row[2]][row[6]] += row[12];

    numStudByMajor2y[row[3]]["Total"] += row[12];
    numStudByMajor2y[row[3]][row[0]] += row[12];
    numStudByMajor2y[row[3]][row[6]] += row[12];

  for row_index in xrange(1, sheet.nrows):
    row = sheet.row_values(row_index)
    flow[row[2]][row[3]]["_1Total"] += row[12] / numStudByMajor1y[row[2]]["Total"]
    flow[row[2]][row[3]]["_1" + row[0]] += row[12] / numStudByMajor1y[row[2]][row[0]]
    flow[row[2]][row[3]]["_1" + row[6]] += row[12] / numStudByMajor1y[row[2]][row[6]]

    flow[row[3]][row[4]]["_2Total"] += row[12] / numStudByMajor2y[row[3]]["Total"]
    flow[row[3]][row[4]]["_2" + row[0]] += row[12] / numStudByMajor2y[row[3]][row[0]]
    flow[row[3]][row[4]]["_2" + row[6]] += row[12] / numStudByMajor2y[row[3]][row[6]]

  flow = SortedDict(flow)
  for key in flow:
    flow[key] = SortedDict(flow[key])

  with open('flow.csv', 'wb') as testfile:
      csv_writer = csv.writer(testfile)
      title = []
      title.extend(flow.keys())
      csv_writer.writerow(title)
      for key in flow:
        row = []
        row.extend(flow[key].values())
        csv_writer.writerow(row)

def source_target(path):

  book = xlrd.open_workbook(path)
  sheet = book.sheet_by_index(0)

  source_major_name = []
  target_major_name = []

  for row_index in xrange(1, sheet.nrows):
    row = sheet.row_values(row_index)
    if row[4]+"0" not in source_major_name:
      source_major_name.append(row[4]+"0")
      source_major_name.append(row[4]+"1")
      target_major_name.append(row[4]+"1")
      target_major_name.append(row[4]+"2")

    if len(source_major_name) is 36:
      break

  sourceTarget = dict([(major,{}) for major in source_major_name])

  for key in sourceTarget:
    sourceTarget[key] = dict([(major,0) for major in target_major_name])

  for row_index in xrange(1, sheet.nrows):
    row = sheet.row_values(row_index)
    sourceTarget[row[2]+"0"][row[3]+"1"] += int(row[12])
    sourceTarget[row[3]+"1"][row[4]+"2"] += int(row[12])

  sourceTarget = SortedDict(sourceTarget)
  for key in sourceTarget:
    sourceTarget[key] = SortedDict(sourceTarget[key])

  # for key in sourceTarget:
  #   for key1 in sourceTarget[key]:
  #     print sourceTarget[key][key1];

  with open('sankey.csv', 'wb') as testfile:
      csv_writer = csv.writer(testfile)
      title = ["source","target","value"]
      csv_writer.writerow(title)
      for key in sourceTarget:
        for key1 in sourceTarget[key]:
          if(key.endswith("0") and key1.endswith("2")):
            continue
          if(key.endswith("1") and key1.endswith("1")):
            continue
          row = [key, key1, sourceTarget[key][key1]]
          csv_writer.writerow(row)

def three_phase(path):

  book = xlrd.open_workbook(path)
  sheet = book.sheet_by_index(0)

  major_name = []

  for row_index in xrange(1, sheet.nrows):
    row = sheet.row_values(row_index)
    if row[4] not in major_name:
      major_name.append(row[4])
    if len(major_name) is 18:
      break

  threePhase = dict([(major,{}) for major in major_name])
  for key in threePhase:
    threePhase[key] = dict([(major,{}) for major in major_name])
    for key1 in threePhase[key]:
      threePhase[key][key1] = dict([(major,0) for major in major_name])

  for row_index in xrange(1, sheet.nrows):
    row = sheet.row_values(row_index)
    threePhase[row[2]][row[3]][row[4]] += int(row[12])    

  with open('three_phase.csv', 'wb') as testfile:
      csv_writer = csv.writer(testfile)
      title = ["T0","T1","T2","count"]
      csv_writer.writerow(title)
      for key in threePhase:
        for key1 in threePhase[key]:
          for key2 in threePhase[key][key1]:
            if(threePhase[key][key1][key2] == 0):
              continue
            csv_writer.writerow([key + "0", key1 + "1", key2 + "2", threePhase[key][key1][key2]])
#----------------------------------------------------------------------
if __name__ == "__main__":
  path = "full.xlsx"
  # open_file(path)
  # source_target(path)
  three_phase(path)
